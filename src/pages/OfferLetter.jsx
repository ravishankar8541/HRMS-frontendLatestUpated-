import { useState } from "react";
import Sidebar from "../components/Sidebar";

const OfferLetter = () => {
  const [formData, setFormData] = useState({
    employeeName: "",
    address: "",
    position: "",
    department: "",
    salary: "",
    joiningDate: "",
    hrName: "",
  });

  const [preview, setPreview] = useState(false);
  const [offerId, setOfferId] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerate = (e) => {
    e.preventDefault();

    const newOfferId = `HRMS/${new Date().getFullYear()}/${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    setOfferId(newOfferId);
    setPreview(true);
  };

  return (

    <div className="flex min-h-screen bg-slate-100 print:bg-white">
      {/* Sidebar hidden in print */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      <div className="flex-1 p-8 print:p-0">
        <div className="max-w-5xl mx-auto print:max-w-none">

          {/* Header hidden in print */}
          {!preview && (
            <div className="mb-6 print:hidden">
              <h1 className="text-3xl font-bold text-slate-800">
                Corporate Offer Letter
              </h1>
            </div>
          )}

          {!preview ? (
            <div className="bg-white rounded-2xl shadow-xl p-8 print:hidden">
              <form
                onSubmit={handleGenerate}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Input label="Employee Name" name="employeeName" onChange={handleChange} />
                <Input label="Address" name="address" onChange={handleChange} />
                <Input label="Designation" name="position" onChange={handleChange} />
                <Input label="Department" name="department" onChange={handleChange} />
                <Input label="Monthly Salary (₹)" name="salary" type="number" onChange={handleChange} />
                <Input label="Joining Date" name="joiningDate" type="date" onChange={handleChange} />
                <Input label="HR Name" name="hrName" onChange={handleChange} />

                <div className="md:col-span-2">
                  <button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold"
                  >
                    Generate Offer Letter
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="print-container">
              <div className="bg-white p-14 shadow-2xl border border-slate-300 print:shadow-none print:border-none print:p-10">

                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold tracking-wide">
                    Viral Ads Media
                  </h2>
                  <p className="text-sm text-slate-500">
                    B-27, Khatu Shyam Mandir Road, Near Max Bazar,
                    Budh Vihar Phase I, Delhi - 110086
                  </p>
                  <div className="w-full h-1 bg-indigo-600 mt-4"></div>
                </div>

                <div className="flex justify-between text-sm mb-6">
                  <p><strong>Offer Ref:</strong> {offerId}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>

                <p className="mb-2"><strong>To,</strong></p>
                <p>{formData.employeeName}</p>
                <p className="mb-6">{formData.address}</p>

                <p className="mb-4">
                  Dear <strong>{formData.employeeName}</strong>,
                </p>

                <p className="mb-4 leading-relaxed">
                  We are pleased to offer you the position of{" "}
                  <strong>{formData.position}</strong> in the{" "}
                  <strong>{formData.department}</strong> department at
                  Viral Ads Media.
                </p>

                <p className="mb-4 leading-relaxed">
                  Your monthly salary will be{" "}
                  <strong>₹{formData.salary} per month</strong>,
                  subject to statutory deductions and company policies.
                </p>

                <p className="mb-4 leading-relaxed">
                  Your employment will commence on{" "}
                  <strong>{formData.joiningDate}</strong>.
                  You will be on probation for 6 months.
                </p>

                <p className="mb-4 leading-relaxed">
                  During your employment, you shall maintain strict
                  confidentiality regarding company data and clients.
                </p>

                <p className="mb-8 leading-relaxed">
                  We look forward to your contribution and a mutually
                  rewarding professional relationship.
                </p>

                <div className="flex justify-between mt-16">
                  <div>
                    <p className="font-semibold">For Viral Ads Media</p>
                    <p className="mt-10">{formData.hrName}</p>
                    <p className="text-sm text-slate-500">HR Manager</p>
                  </div>

                  <div>
                    <p className="font-semibold">Accepted By</p>
                    <p className="mt-10">________________________</p>
                    <p className="text-sm text-slate-500">
                      {formData.employeeName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-6 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Print / Download PDF
                </button>

                <button
                  onClick={() => setPreview(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Input = ({ label, name, type = "text", onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-2">
      {label}
    </label>
    <input
      type={type}
      name={name}
      required
      onChange={onChange}
      className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

export default OfferLetter;