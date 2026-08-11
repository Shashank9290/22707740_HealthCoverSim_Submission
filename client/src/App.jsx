import { useState } from "react";
import "./App.css";

function App() {
  const [formData, setFormData] = useState({
    customerName: "",
    coverType: "",
    applicant1Age: "",
    applicant1History: "",
    applicant2Age: "",
    applicant2History: "",
    hospitalCover: "",
    extrasCover: "",
    paymentFrequency: "",
    annualDiscount: "",
    notes: "",
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedQuotes, setSavedQuotes] = useState([]);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const hospitalPrices = {
    None: 0,
    Basic: 90,
    Bronze: 120,
    Silver: 160,
    Gold: 220,
  };

  const extrasPrices = {
    None: 0,
    Basic: 25,
    Standard: 45,
    Premium: 70,
  };

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  function getLhcLoading(age, history) {
    if (formData.hospitalCover === "None") {
      return 0;
    }

    if (history === "Yes" || history === "Not sure") {
      return 0;
    }

    if (history === "No" && Number(age) > 30) {
      return (Number(age) - 30) * 0.02;
    }

    return 0;
  }

  function validateForm() {
    if (formData.customerName.trim() === "") {
      return "Customer name is required.";
    }

    if (formData.coverType === "") {
      return "Please select a cover type.";
    }

    if (
      formData.applicant1Age === "" ||
      Number(formData.applicant1Age) < 18 ||
      Number(formData.applicant1Age) > 100
    ) {
      return "Applicant 1 age must be between 18 and 100.";
    }

    if (formData.applicant1History === "") {
      return "Please select Applicant 1 hospital cover history.";
    }

    if (
      formData.coverType === "Couple" ||
      formData.coverType === "Family"
    ) {
      if (
        formData.applicant2Age === "" ||
        Number(formData.applicant2Age) < 18 ||
        Number(formData.applicant2Age) > 100
      ) {
        return "Applicant 2 age must be between 18 and 100.";
      }

      if (formData.applicant2History === "") {
        return "Please select Applicant 2 hospital cover history.";
      }
    }

    if (formData.hospitalCover === "") {
      return "Please select a hospital cover level.";
    }

    if (formData.extrasCover === "") {
      return "Please select an extras cover level.";
    }

    if (formData.paymentFrequency === "") {
      return "Please select a payment frequency.";
    }

    if (
      formData.annualDiscount === "" ||
      Number(formData.annualDiscount) < 0 ||
      Number(formData.annualDiscount) > 10
    ) {
      return "Annual payment discount must be between 0 and 10.";
    }

    return "";
  }

  function buildQuoteData() {
    return {
      customer_name: formData.customerName,
      cover_type: formData.coverType,
      applicant1_age: Number(formData.applicant1Age),
      applicant1_cover_history: formData.applicant1History,

      applicant2_age:
        formData.coverType === "Single"
          ? null
          : Number(formData.applicant2Age),

      applicant2_cover_history:
        formData.coverType === "Single"
          ? null
          : formData.applicant2History,

      hospital_cover: formData.hospitalCover,
      extras_cover: formData.extrasCover,
      payment_frequency: formData.paymentFrequency,
      annual_discount: Number(formData.annualDiscount),
      notes: formData.notes,
    };
  }

  async function saveQuote() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/quotes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildQuoteData()),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setSaveMessage("Failed to save quote.");
        return;
      }

      setSaveMessage(
        `Quote saved successfully. Quote ID: ${data.id}`
      );

      await loadSavedQuotes();
    } catch (error) {
      console.error(error);
      setSaveMessage("Could not connect to the backend.");
    }
  }

  async function updateQuote() {
    try {
      const response = await fetch(
        `http://localhost:5000/api/quotes/${editingId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildQuoteData()),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update quote.");
        return;
      }

      setSaveMessage("Quote updated successfully.");
      setEditingId(null);

      await loadSavedQuotes();
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend.");
    }
  }

  async function loadSavedQuotes() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/quotes"
      );

      const data = await response.json();

      if (!response.ok) {
        setError("Failed to load saved quotes.");
        return;
      }

      setSavedQuotes(data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend.");
    }
  }

  async function viewQuote(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/quotes/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to load quote.");
        return;
      }

      setSelectedQuote(data);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend.");
    }
  }

  function editQuote(quote) {
    setFormData({
      customerName: quote.customer_name,
      coverType: quote.cover_type,
      applicant1Age: quote.applicant1_age,
      applicant1History: quote.applicant1_cover_history,
      applicant2Age: quote.applicant2_age || "",
      applicant2History: quote.applicant2_cover_history || "",
      hospitalCover: quote.hospital_cover,
      extrasCover: quote.extras_cover,
      paymentFrequency: quote.payment_frequency,
      annualDiscount: quote.annual_discount,
      notes: quote.notes || "",
    });

    setEditingId(quote.id);
    setSelectedQuote(null);
    setResult(null);
    setSaveMessage(`Editing Quote ID: ${quote.id}`);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteQuote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quote?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/quotes/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete quote.");
        return;
      }

      setSaveMessage("Quote deleted successfully.");
      setSelectedQuote(null);

      if (editingId === id) {
        setEditingId(null);
      }

      await loadSavedQuotes();
    } catch (error) {
      console.error(error);
      setError("Could not connect to the backend.");
    }
  }

  async function calculateQuote() {
    const validationError = validateForm();

    if (validationError !== "") {
      setError(validationError);
      setResult(null);
      setSaveMessage("");
      return;
    }

    setError("");

    const adultCount =
      formData.coverType === "Single" ? 1 : 2;

    const hospitalPrice =
      hospitalPrices[formData.hospitalCover] || 0;

    const extrasPrice =
      extrasPrices[formData.extrasCover] || 0;

    const applicant1Loading = getLhcLoading(
      formData.applicant1Age,
      formData.applicant1History
    );

    let applicant2Loading = 0;

    if (
      formData.coverType === "Couple" ||
      formData.coverType === "Family"
    ) {
      applicant2Loading = getLhcLoading(
        formData.applicant2Age,
        formData.applicant2History
      );
    }

    const applicant1Hospital =
      hospitalPrice * (1 + applicant1Loading);

    let applicant2Hospital = 0;

    if (
      formData.coverType === "Couple" ||
      formData.coverType === "Family"
    ) {
      applicant2Hospital =
        hospitalPrice * (1 + applicant2Loading);
    }

    const hospitalTotal =
      applicant1Hospital + applicant2Hospital;

    const extrasTotal =
      extrasPrice * adultCount;

    const familyFee =
      formData.coverType === "Family" ? 30 : 0;

    const monthlyPremium =
      hospitalTotal + extrasTotal + familyFee;

    const yearlyBeforeDiscount =
      monthlyPremium * 12;

    const annualDiscountAmount =
      formData.paymentFrequency === "Yearly"
        ? yearlyBeforeDiscount *
          (Number(formData.annualDiscount) / 100)
        : 0;

    const yearlyAfterDiscount =
      yearlyBeforeDiscount - annualDiscountAmount;

    setResult({
      hospitalPrice,
      extrasPrice,
      adultCount,
      applicant1Loading,
      applicant2Loading,
      applicant1Hospital,
      applicant2Hospital,
      hospitalTotal,
      extrasTotal,
      familyFee,
      monthlyPremium,
      yearlyBeforeDiscount,
      annualDiscountAmount,
      yearlyAfterDiscount,
    });

    if (editingId) {
      await updateQuote();
    } else {
      await saveQuote();
    }
  }

  return (
    <div className="main-container">
      <h1>HealthCoverSim</h1>
      <h2>Private Health Insurance Quote Simulator</h2>

      {editingId && (
        <p className="warning-message">
          Editing existing quote ID: {editingId}
        </p>
      )}

      <form>
        <div>
          <label>Customer Name:</label>
          <br />
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <label>Cover Type:</label>
          <br />
          <select
            name="coverType"
            value={formData.coverType}
            onChange={handleChange}
          >
            <option value="">Select Cover Type</option>
            <option value="Single">Single</option>
            <option value="Couple">Couple</option>
            <option value="Family">Family</option>
          </select>
        </div>

        <br />

        <div>
          <label>Applicant 1 Age:</label>
          <br />
          <input
            type="number"
            name="applicant1Age"
            min="18"
            max="100"
            value={formData.applicant1Age}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <label>Applicant 1 Hospital Cover History:</label>
          <br />
          <select
            name="applicant1History"
            value={formData.applicant1History}
            onChange={handleChange}
          >
            <option value="">Select History</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="Not sure">Not sure</option>
          </select>
        </div>

        {(formData.coverType === "Couple" ||
          formData.coverType === "Family") && (
          <>
            <br />

            <div>
              <label>Applicant 2 Age:</label>
              <br />
              <input
                type="number"
                name="applicant2Age"
                min="18"
                max="100"
                value={formData.applicant2Age}
                onChange={handleChange}
              />
            </div>

            <br />

            <div>
              <label>Applicant 2 Hospital Cover History:</label>
              <br />
              <select
                name="applicant2History"
                value={formData.applicant2History}
                onChange={handleChange}
              >
                <option value="">Select History</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
          </>
        )}

        <br />

        <div>
          <label>Hospital Cover Level:</label>
          <br />
          <select
            name="hospitalCover"
            value={formData.hospitalCover}
            onChange={handleChange}
          >
            <option value="">Select Hospital Cover</option>
            <option value="None">None</option>
            <option value="Basic">Basic</option>
            <option value="Bronze">Bronze</option>
            <option value="Silver">Silver</option>
            <option value="Gold">Gold</option>
          </select>
        </div>

        <br />

        <div>
          <label>Extras Cover Level:</label>
          <br />
          <select
            name="extrasCover"
            value={formData.extrasCover}
            onChange={handleChange}
          >
            <option value="">Select Extras Cover</option>
            <option value="None">None</option>
            <option value="Basic">Basic</option>
            <option value="Standard">Standard</option>
            <option value="Premium">Premium</option>
          </select>
        </div>

        <br />

        <div>
          <label>Payment Frequency:</label>
          <br />
          <select
            name="paymentFrequency"
            value={formData.paymentFrequency}
            onChange={handleChange}
          >
            <option value="">
              Select Payment Frequency
            </option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>

        <br />

        <div>
          <label>Annual Payment Discount (%):</label>
          <br />
          <input
            type="number"
            name="annualDiscount"
            min="0"
            max="10"
            value={formData.annualDiscount}
            onChange={handleChange}
          />
        </div>

        <br />

        <div>
          <label>Notes:</label>
          <br />
          <textarea
            name="notes"
            rows="4"
            cols="40"
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </div>

        <br />

        <button type="button" onClick={calculateQuote}>
          {editingId
            ? "Calculate and Update Quote"
            : "Calculate and Save Quote"}
        </button>
      </form>

      {error && (
        <p className="error-message">
          Error: {error}
        </p>
      )}

      {saveMessage && (
        <p className="success-message">
          {saveMessage}
        </p>
      )}

      {result && (
        <div className="quote-result">
          <h2>Quote Result</h2>

          <p>
            Applicant 1 LHC Loading:{" "}
            {(result.applicant1Loading * 100).toFixed(0)}%
          </p>

          {formData.applicant1History === "Not sure" && (
            <p className="warning-message">
              Applicant 1 cover history is unknown. This quote
              may be inaccurate.
            </p>
          )}

          {(formData.coverType === "Couple" ||
            formData.coverType === "Family") && (
            <>
              <p>
                Applicant 2 LHC Loading:{" "}
                {(result.applicant2Loading * 100).toFixed(0)}%
              </p>

              {formData.applicant2History === "Not sure" && (
                <p className="warning-message">
                  Applicant 2 cover history is unknown. This quote
                  may be inaccurate.
                </p>
              )}
            </>
          )}

          <p>
            Hospital Total: $
            {result.hospitalTotal.toFixed(2)}
          </p>

          <p>
            Extras Total: $
            {result.extrasTotal.toFixed(2)}
          </p>

          <p>
            Family Fee: $
            {result.familyFee.toFixed(2)}
          </p>

          <p>
            Monthly Premium: $
            {result.monthlyPremium.toFixed(2)}
          </p>

          <p>
            Yearly Before Discount: $
            {result.yearlyBeforeDiscount.toFixed(2)}
          </p>

          {formData.paymentFrequency === "Yearly" && (
            <p>
              Yearly After Discount: $
              {result.yearlyAfterDiscount.toFixed(2)}
            </p>
          )}

          <div className="calculation-box">
            <h2>How Your Premium Was Calculated</h2>

            <p>
              <strong>Hospital Base Price:</strong>{" "}
              ${result.hospitalPrice.toFixed(2)} per adult
            </p>

            <p>
              Applicant 1 Hospital Cost: $
              {result.hospitalPrice.toFixed(2)}
              {" × "}
              (1 + {(result.applicant1Loading * 100).toFixed(0)}%)
              {" = $"}
              {result.applicant1Hospital.toFixed(2)}
            </p>

            {formData.coverType !== "Single" && (
              <p>
                Applicant 2 Hospital Cost: $
                {result.hospitalPrice.toFixed(2)}
                {" × "}
                (1 + {(result.applicant2Loading * 100).toFixed(0)}%)
                {" = $"}
                {result.applicant2Hospital.toFixed(2)}
              </p>
            )}

            <p>
              <strong>Total Hospital Cost:</strong>{" "}
              ${result.hospitalTotal.toFixed(2)}
            </p>

            <p>
              <strong>Extras Cost:</strong>{" "}
              ${result.extrasPrice.toFixed(2)}
              {" × "}
              {result.adultCount} adult
              {result.adultCount > 1 ? "s" : ""}
              {" = $"}
              {result.extrasTotal.toFixed(2)}
            </p>

            {formData.coverType === "Family" && (
              <p>
                <strong>Family Fee:</strong> $30.00
              </p>
            )}

            <p>
              <strong>Monthly Premium:</strong>{" "}
              ${result.hospitalTotal.toFixed(2)}
              {" + $"}
              {result.extrasTotal.toFixed(2)}
              {" + $"}
              {result.familyFee.toFixed(2)}
              {" = $"}
              {result.monthlyPremium.toFixed(2)}
            </p>

            <p>
              <strong>Annual Premium Before Discount:</strong>{" "}
              ${result.monthlyPremium.toFixed(2)}
              {" × 12 = $"}
              {result.yearlyBeforeDiscount.toFixed(2)}
            </p>

            {formData.paymentFrequency === "Yearly" && (
              <>
                <p>
                  <strong>
                    Annual Discount ({formData.annualDiscount}%):
                  </strong>{" "}
                  ${result.annualDiscountAmount.toFixed(2)}
                </p>

                <p>
                  <strong>Final Yearly Premium:</strong>{" "}
                  ${result.yearlyBeforeDiscount.toFixed(2)}
                  {" - $"}
                  {result.annualDiscountAmount.toFixed(2)}
                  {" = $"}
                  {result.yearlyAfterDiscount.toFixed(2)}
                </p>
              </>
            )}

            <p>
              <strong>
                Lifetime Health Cover loading applies only to
                hospital cover. It does not apply to extras cover.
              </strong>
            </p>
          </div>
        </div>
      )}

      <div className="saved-section">
        <h2>Saved Quotes</h2>

        <button type="button" onClick={loadSavedQuotes}>
          Load Saved Quotes
        </button>

        <br />
        <br />

        {savedQuotes.length === 0 ? (
          <p>No saved quotes loaded.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Cover Type</th>
                <th>Hospital</th>
                <th>Extras</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {savedQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.id}</td>
                  <td>{quote.customer_name}</td>
                  <td>{quote.cover_type}</td>
                  <td>{quote.hospital_cover}</td>
                  <td>{quote.extras_cover}</td>
                  <td>{quote.payment_frequency}</td>

                  <td>
                    <button
                      type="button"
                      onClick={() => viewQuote(quote.id)}
                    >
                      View
                    </button>

                    <button
                      type="button"
                      onClick={() => editQuote(quote)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteQuote(quote.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedQuote && (
        <div className="quote-details">
          <h2>Quote Details</h2>

          <p>
            <strong>Quote ID:</strong> {selectedQuote.id}
          </p>

          <p>
            <strong>Customer:</strong>{" "}
            {selectedQuote.customer_name}
          </p>

          <p>
            <strong>Cover Type:</strong>{" "}
            {selectedQuote.cover_type}
          </p>

          <p>
            <strong>Applicant 1 Age:</strong>{" "}
            {selectedQuote.applicant1_age}
          </p>

          <p>
            <strong>Applicant 1 History:</strong>{" "}
            {selectedQuote.applicant1_cover_history}
          </p>

          {selectedQuote.cover_type !== "Single" && (
            <>
              <p>
                <strong>Applicant 2 Age:</strong>{" "}
                {selectedQuote.applicant2_age}
              </p>

              <p>
                <strong>Applicant 2 History:</strong>{" "}
                {selectedQuote.applicant2_cover_history}
              </p>
            </>
          )}

          <p>
            <strong>Hospital Cover:</strong>{" "}
            {selectedQuote.hospital_cover}
          </p>

          <p>
            <strong>Extras Cover:</strong>{" "}
            {selectedQuote.extras_cover}
          </p>

          <p>
            <strong>Payment Frequency:</strong>{" "}
            {selectedQuote.payment_frequency}
          </p>

          <p>
            <strong>Annual Discount:</strong>{" "}
            {selectedQuote.annual_discount}%
          </p>

          <p>
            <strong>Notes:</strong>{" "}
            {selectedQuote.notes || "No notes"}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;