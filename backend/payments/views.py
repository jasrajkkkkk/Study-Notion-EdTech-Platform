import razorpay
from django.conf import settings
from django.db import transaction
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import PaymentSerializer
from courses.models import Course
from enrollments.models import Enrollment

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CreateOrderView(APIView):
    """Step 1 of checkout: server creates the Razorpay order. The amount is
    read from the Course row in our own DB — never trust an amount the
    client might send — so a tampered frontend request can't buy a course
    for less than its real price."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        course_id = request.data.get("course")
        course = Course.objects.filter(pk=course_id, is_published=True).first()
        if course is None:
            return Response({"detail": "Course not found."}, status=status.HTTP_404_NOT_FOUND)
        if course.price <= 0:
            return Response({"detail": "This course is free — enroll directly."}, status=400)

        amount_paise = int(course.price * 100)
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "payment_capture": 1,
            "notes": {"course_id": str(course.id), "student_id": str(request.user.id)},
        })

        Payment.objects.create(
            student=request.user,
            course=course,
            amount=course.price,
            razorpay_order_id=order["id"],
            status=Payment.Status.CREATED,
        )

        return Response({
            "order_id": order["id"],
            "amount": amount_paise,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "course_title": course.title,
        })


class VerifyPaymentView(APIView):
    """Step 2 of checkout: Razorpay's checkout.js on the frontend returns
    razorpay_order_id / razorpay_payment_id / razorpay_signature after the
    user pays. We MUST re-verify that signature server-side with our secret
    key before granting access — the frontend values alone prove nothing,
    since anyone can fabricate a success callback in devtools."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id")
        payment_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")

        payment = Payment.objects.filter(
            razorpay_order_id=order_id, student=request.user
        ).first()
        if payment is None:
            return Response({"detail": "Unknown order."}, status=404)

        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
        except razorpay.errors.SignatureVerificationError:
            payment.status = Payment.Status.FAILED
            payment.save(update_fields=["status"])
            return Response({"detail": "Payment verification failed."}, status=400)

        with transaction.atomic():
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature = signature
            payment.status = Payment.Status.PAID
            payment.save()

            Enrollment.objects.update_or_create(
                student=request.user,
                course=payment.course,
                defaults={"has_paid": True},
            )

        return Response(PaymentSerializer(payment).data)
