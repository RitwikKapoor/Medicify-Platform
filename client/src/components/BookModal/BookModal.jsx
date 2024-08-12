import React, { useState } from "react";
import { setLoading } from "../../redux/rootSlice";
import HashLoader from "react-spinners/HashLoader";
import axios from "axios";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

const BookModal = ({ onClose, starttime, endtime }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.root);
  const { email } = useSelector((state) => state.root.user);
  const { pathname } = useLocation();
  const id = pathname.split("/").slice(-1)[0];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    dispatch(setLoading(true));

    const dataToSend = {
      ...formData,
      email,
    };

    axios
      .post(
        `${import.meta.env.VITE_APP_BASE_URL}/appoint/book/${id}`,
        dataToSend,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        if (res.status === 201) {
          dispatch(setLoading(false));
          const { order } = res.data;
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: "INR",
            name: "Medicify",
            description: "Doctor Appointment",
            order_id: order.id,
            handler: function (response) {
              alert(`Payment Succesful with id: ${response.razorpay_payment_id}`);
            },
            prefill: {
              name: "Your Name",
              email: "your-email@example.com",
              contact: "9999999999",
            },
            notes: {
              address: "Razorpay Corporate Office",
            },
            theme: {
              color: "#3399cc",
            },
          };
          const rzp1 = new Razorpay(options);
          rzp1.on("payment.failed", function (response) {
            toast.error(response.error.description);
          });
          rzp1.open();
        } else {
          throw new Error("Unexpected response");
        }
      })
      .catch((error) => {
        dispatch(setLoading(false));
        toast.error(error.response.data.msg);
      });
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-md shadow-md w-96">
        <h2 className="text-xl mb-4">Book Appointment</h2>

        <div className="mb-4">
          <form onSubmit={handleBookAppointment}>
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                required
                min={new Date().toISOString().split("T")[0]}
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Start Time
              </label>
              <input
                type="time"
                id="time"
                name="time"
                min={starttime}
                max={endtime}
                value={formData.time}
                onChange={handleInputChange}
                required
                className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="flex justify-end">
              <button className="btn bg-green-500 text-white px-4 py-2 rounded-md mr-2">
                {loading ? <HashLoader size={35} color="#ffffff" /> : "Book"}
              </button>
              <button
                className="btn bg-gray-500 text-white px-4 py-2 rounded-md"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
