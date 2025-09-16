import React, { useState, useEffect } from 'react'
import h from "components/htm_create_element"
import NewTransactionModal from "components/NewTransactionModal"
import RulesModal from 'components/RulesModal'

export default function BookkeepingDashboard() {

    //STATES

    const [transactions, setTransactions] = useState([])
    const [selected, setSelected] = useState(new Set())
    const [fileError, setFileError] = useState(null)
    const [reviewOnly, setReviewOnly] = useState(false)
    const [bulkCategory, setBulkCategory] = useState('')
    const [editing, setEditing] = useState(new Set())
    const [showModal, setShowModal] = useState(false)
    const [showRulesModal, setShowRulesModal] = useState(false)

    //USE EFFECTS

    useEffect(() => {
       fetchTransactions()
    }, [])

    //API FUNCTIONS

    function fetchTransactions() {
        fetch("/api/v1/transactions")
        .then(res => res.json())
        .then(data => setTransactions(data.data)) 
        .catch(err => console.error("Failed to fetch transactions:", err))
    }

    function handleFile(e) {
        const file = e.target.files[0]
        if (!file) return

        setFileError("Adding csv transactions...")
        const form = new FormData()
        form.append('file', file)

        fetch('/api/v1/transactions/import_csv', {
            method: 'POST',
            body: form
        })
            .then(res => res.json())
            .then(res => {
            if (res.message) {
                setFileError("Successfully Added csv Transactions")
                fetchTransactions()
            } else if (res.error) {
                setFileError(res.error)
            }
            })
            .catch(err => {
            console.error("CSV import failed:", err)
            setFileError("Failed to import CSV")
            })
    }

    function handleAdd(newTx) {
        console.log(newTx)
        fetch("api/v1/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction: newTx }),
        })
        .then(res => res.json())
        .then(data => {
            fetchTransactions()
        })
        setShowModal(false)
    }

    function applyBulkCategory() {
        if (!bulkCategory || selected.size === 0) return

        fetch('/api/v1/transactions/bulk_categorize', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
            transaction_ids: Array.from(selected), 
            category: bulkCategory 
            })
        })
        .then(r => r.json())
        .then(resp => {
            setSelected(new Set())
            fetchTransactions()
        })
        .catch(err => {
            console.error("Failed to apply bulk category:", err)
        })
    }

    function saveChanges(id) {
        const tx = transactions.find(tr => tr.id === id)
        if (!tx) return

        const updatedAttributes = {
            ...tx.attributes,
            flags: [],
            needs_review: false
        }
        console.log(updatedAttributes)

        fetch(`api/v1/transactions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedAttributes),
        }).then(r => r.json())
        .then(resp => {
            fetchTransactions()
        })
        .catch(err => {
            console.error("Failed to apply edit:", err)
        })

        editing.delete(id)
    }

    function handleDelete(id) {
        if (!confirm("Are you sure you want to delete this transaction?")) return

        fetch(`/api/v1/transactions/${id}`, {
            method: "DELETE",
        })
            .then(res => {
            if (res.ok) {
                fetchTransactions() 
            } else {
                console.error("Failed to delete transaction")
            }
            })
        }

    //FUNCTIONS

    function toggle(id) {
        const s = new Set(selected)
        if (s.has(id)) s.delete(id)
        else s.add(id)
        setSelected(s)
    }

    function toggleEdit(id) {
        const newSet = new Set(editing) 
        if (newSet.has(id)) newSet.delete(id)
        else newSet.add(id)
        setEditing(newSet)
    }

    function handleChange(id, field, value) {
        const tx = transactions.find(tr => tr.id === id)
        if (tx) {
            tx.attributes[field] = value
        }
    }

    //DISPLAY FUNCTIONS

    function displayTransactions() {
        const filtered = reviewOnly
            ? transactions.filter(t => t.attributes.needs_review)
            : transactions

        return filtered.map(t => {
            const isEditing = editing.has(t.id)

            return h`<tr key=${t.id}>
            <td>
                <input
                type="checkbox"
                checked=${selected.has(t.id)}
                onChange=${() => toggle(t.id)}
                />
            </td>

            <td>
                ${isEditing
                ? h`<input type="date"
                    defaultValue=${t.attributes.date.split("T")[0]}
                    onChange=${e => handleChange(t.id, "date", e.target.value)} />`
                : new Date(t.attributes.date).toLocaleString()}
            </td>

            <td>
                ${isEditing
                ? h`<input type="text"
                    defaultValue=${t.attributes.description}
                    onChange=${e => handleChange(t.id, "description", e.target.value)} />`
                : t.attributes.description}
            </td>

            <td>
                ${isEditing
                ? h`<input type="number" step="0.01"
                    defaultValue=${t.attributes.amount}
                    onChange=${e => handleChange(t.id, "amount", e.target.value)} />`
                : t.attributes.amount}
            </td>

            <td>
                ${isEditing
                ? h`<input type="text"
                    defaultValue=${t.attributes.category || ""}
                    onChange=${e => handleChange(t.id, "category", e.target.value)} />`
                : (t.attributes.category || h`<em className="text-gray-400">uncategorized</em>`)}
            </td>

            <td>
                ${
                t.attributes.flags?.length
                    ? t.attributes.flags.map((f, i) =>
                        h`<span key=${i} className="mr-2 text-sm text-red-600">${f}</span>`
                    )
                    : "—"
                }
            </td>

            <td>
                ${isEditing
                ? h`
                    <button onClick=${() => saveChanges(t.id)} className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
                    <button onClick=${() => toggleEdit(t.id)} className="button-delete" >Cancel</button>
                    `
                : h`<button onClick=${() => toggleEdit(t.id)} className="px-4 py-1 bg-blue-600 text-white rounded">Edit</button>
                    <button className="button-delete" onClick=${() => handleDelete(t.id)}>Delete</button>
                    `
                }
            </td>
            </tr>`
        })
    }

    
    return (
        h`<div className="p-6 max-w-6xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl font-bold">Minimal Bookkeeping Dashboard</h1>
                <p className="text-sm text-gray-600">CSV import • bulk categorize • anomaly flags • review queue</p>
            </header>


        <section className="mb-4 flex gap-4">
            <label className="flex items-center gap-2">
                <input type="file" accept="text/csv" onChange=${handleFile} />
            </label>
            <label className="flex items-center gap-2 ml-auto">${fileError}</label>
            <button onClick=${fetchTransactions} className="px-4 py-1 bg-blue-600 text-white rounded">Load All</button>
            <button className="px-4 py-1 bg-blue-600 text-white rounded" onClick=${() => setShowRulesModal(true)}>Manage Rules</button>
            <label className="flex items-center gap-2 ml-auto">
                <input type="checkbox" checked=${reviewOnly} onChange=${() => setReviewOnly(!reviewOnly)} /> Show only needing review
            </label>
        </section>


        <section className="mb-4 flex gap-2">
            <input value=${bulkCategory} onChange=${e => setBulkCategory(e.target.value)} placeholder="Category to apply" className="border p-2 rounded" />
            <button onClick=${applyBulkCategory} className="bg-blue-600 text-white px-4 py-2 rounded">Apply to selected</button>
            <button
                class="bg-blue-600 text-white px-4 py-2 rounded"
                onClick=${() => setShowModal(true)}
            >
                Add Transaction
            </button>
        </section>
        
        ${showRulesModal && h`<${RulesModal} onClose=${() => setShowRulesModal(false)} />`}
        ${showModal && h`<${NewTransactionModal} onSave=${handleAdd} onClose=${() => setShowModal(false)} />`}

        <section>
            <table className="w-full table-auto border-collapse">
                <thead>
                    <tr className="text-left">
                        <th></th>
                        <th>When</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Category</th>
                        <th>Flags</th>
                    </tr>
                </thead>
                <tbody>
                    ${displayTransactions()}
                </tbody>
            </table>
        </section>

    </div>`

    )
}
