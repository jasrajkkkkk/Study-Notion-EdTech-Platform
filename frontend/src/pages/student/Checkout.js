import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Checkout() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState("creating"); // creating | ready | paying | error
  const [errorMsg, setErrorMsg] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = async () => {
      try {
        const { data: order } = await api.post("/payments/create-order/", { course: courseId });
        setStatus("ready");
        openRazorpay(order);
      } catch (err) {
        setStatus("error");
        setErrorMsg(err.response?.data?.detail || "Could not start checkout.");
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const openRazorpay = (order) => {
    // Razorpay's checkout.js is loaded globally in public/index.html.
    // We only ever hand it the order_id the backend created — amount and
    // currency are derived from that order, so nothing client-side can
    // change what actually gets charged.
    const rzp = new window.Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "EdTech Platform",
      description: order.course_title,
      prefill: { name: user?.username },
      handler: async (response) => {
        setStatus("paying");
        try {
          await api.post("/payments/verify/", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          navigate(`/student/courses/${courseId}`);
        } catch {
          setStatus("error");
          setErrorMsg("Payment succeeded but verification failed. Contact support.");
        }
      },
      modal: {
        ondismiss: () => navigate(`/student/courses/${courseId}`),
      },
      theme: { color: "#2563eb" },
    });
    rzp.open();
  };

  return (
    <div className="container" style={{ maxWidth: 480, textAlign: "center" }}>
      <h2>Checkout</h2>
      {status === "creating" && <p>Setting up secure payment…</p>}
      {status === "ready" && <p>Opening Razorpay checkout…</p>}
      {status === "paying" && <p>Verifying your payment…</p>}
      {status === "error" && (
        <>
          <p className="error-text">{errorMsg}</p>
          <button className="btn-secondary" onClick={() => navigate(`/student/courses/${courseId}`)}>
            Back to course
          </button>
        </>
      )}
    </div>
  );
}
