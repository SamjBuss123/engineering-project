import React, { useState } from "react"
import htm from "htm"

const h = htm.bind(React.createElement)

export default function NewTransactionModal({ onSave, onClose }) {

    // STATES

  const [newTransaction, setNewTransaction] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
    needs_review: false,
  })

  // FUNCTIONS

  function handleChange(field, value) {
    setNewTransaction({ ...newTransaction, [field]: value })
  }

  function handleSave() {
    onSave(newTransaction)
    setNewTransaction({
      date: "",
      description: "",
      amount: "",
      category: "",
      needs_review: false,
    })
  }

  //DISPLAY

  return h`
    <div class="modal-overlay">
      <div class="modal-content">
        <h2 class="text-xl font-bold mb-4">New Transaction</h2>

        <label class="block mb-2">Date</label>
        <input
          type="date"
          class="border rounded w-full mb-2 p-1"
          value=${newTransaction.date}
          onChange=${e => handleChange("date", e.target.value)}
        />

        <label class="block mb-2">Description</label>
        <input
          type="text"
          class="border rounded w-full mb-2 p-1"
          value=${newTransaction.description}
          onChange=${e => handleChange("description", e.target.value)}
        />

        <label class="block mb-2">Amount</label>
        <input
          type="number"
          step="0.01"
          class="border rounded w-full mb-2 p-1"
          value=${newTransaction.amount}
          onChange=${e => handleChange("amount", e.target.value)}
        />

        <label class="block mb-2">Category</label>
        <input
          type="text"
          class="border rounded w-full mb-4 p-1"
          value=${newTransaction.category}
          onChange=${e => handleChange("category", e.target.value)}
        />

        <div class="flex justify-end space-x-2">
          <button
            class="px-4 py-2 bg-gray-600 rounded"
            onClick=${onClose}
          >
            Cancel
          </button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded"
            onClick=${handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  `
}
