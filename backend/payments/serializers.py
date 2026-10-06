from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id", "student", "course", "amount", "razorpay_order_id",
            "razorpay_payment_id", "status", "created_at",
        ]
        read_only_fields = fields
