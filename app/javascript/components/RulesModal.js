import React, { useState, useEffect } from "react"
import htm from "htm"

const h = htm.bind(React.createElement)

export default function RulesModal({ onClose }) {
    // STATES
  const [rules, setRules] = useState([])
  const [editingRule, setEditingRule] = useState(null)
  const [form, setForm] = useState({ name: "", condition: "", action: "", active: true })
  const [error, setError] = useState(null)

  // USE EFFECT
  useEffect(() => {
    fetch("/api/v1/rules")
      .then(r => r.json())
      .then(setRules)
      .catch(err => console.error("Failed to fetch rules:", err))
  }, [])

  // FETCHING FUNCTIONS

  function handleSave() {
    const method = editingRule ? "PATCH" : "POST"
    const url = editingRule ? `/api/v1/rules/${editingRule.id}` : "/api/v1/rules"

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule: form })
    })
      .then(r => r.json())
      .then(savedRule => {
        if (savedRule.error) {
          setError(savedRule.error)
        } else {
          if (editingRule) {
            setRules(prev => prev.map(r => (r.id === savedRule.id ? savedRule : r)))
          } else {
            setRules(prev => [...prev, savedRule])
          }
          setForm({ name: "", condition: "", action: "", active: true })
          setEditingRule(null)
          setError(null)
        }
      })
      .catch(err => setError("Failed to save rule"))
  }

    function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this rule?")) return

        fetch(`/api/v1/rules/${id}`, { method: "DELETE" })
        .then(res => {
            if (res.ok) setRules(prev => prev.filter(r => r.id !== id))
        })
        .catch(err => console.error("Failed to delete rule:", err))
    }

  // FUNCTIONS 

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }))
  }

  function handleEdit(rule) {
    setEditingRule(rule)
    setForm({
      name: rule.name,
      condition: rule.condition,
      action: rule.action,
      active: rule.active
    })
  }

  //DISPLAY

  return h`
    <div className="modal-overlay">
      <div className="modal-content-rules">
        <h2 className="text-xl font-bold mb-4">Manage Rules</h2>

        <table className="w-full table-auto border-collaps">
          <thead>
            <tr>
              <th>Name</th>
              <th>Condition</th>
              <th>Action</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rules.map(rule => h`
              <tr key=${rule.id} className="border-b">
                <td>${rule.name}</td>
                <td>${rule.condition}</td>
                <td>${rule.action}</td>
                <td>${rule.active ? "Yes" : "No"}</td>
                <td>
                  <button className="px-4 py-1 bg-blue-600 text-white rounded" onClick=${() => handleEdit(rule)}>Edit</button>
                  <button className="button-delete" onClick=${() => handleDelete(rule.id)}>Delete</button>
                </td>
              </tr>
            `)}
          </tbody>
        </table>

        <h3 className="text-lg font-semibold mb-2">${editingRule ? "Edit Rule" : "Add Rule"}</h3>

        ${error && h`<div className="text-red-600 mb-2">${error}</div>`}

        <div className="block mb-2">
          <input 
            className="border rounded w-full mb-2 p-1"
            placeholder="Name"
            name="name"
            value=${form.name}
            onChange=${handleChange} />
          <input 
            className="border rounded w-full mb-2 p-1"
            placeholder="Condition (e.g. description.includes('Amazon'))"
            name="condition"
            value=${form.condition}
            onChange=${handleChange} />
          <input 
            className="border rounded w-full mb-2 p-1"
            placeholder="Action (e.g. { category: 'Shopping' })"
            name="action"
            value=${form.action}
            onChange=${handleChange} />
          <label className="inline-flex items-center mt-1">
            <input 
              type="checkbox"
              name="active"
              checked=${form.active}
              onChange=${handleChange} />
            <span className="ml-2">Active</span>
          </label>
        </div>

        <div className="flex justify-end mt-4">
          <button className="mr-2 px-4 py-2 bg-gray-300 rounded" onClick=${onClose}>Close</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick=${handleSave}>${editingRule ? "Update" : "Add"}</button>
        </div>
      </div>
    </div>
  `
}
