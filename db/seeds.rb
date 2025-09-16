# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
transactions = Transaction.create([
    {
        date:  Date.new(2025, 9, 11),
        description: "test book 1",
        amount: 10.00,
        category: "Fiction",
        source: "User",
        needs_review: false,
        flags: []
    },    
    {
        date:  Date.new(2025, 9, 11),
        description: "test book 2",
        amount: 20.00,
        category: "Fiction",
        source: "User",
        needs_review: false,
        flags: []
    },
    {
        date:  Date.new(2025, 9, 11),
        description: "test book 3",
        amount: 30.00,
        category: "Non-Fiction",
        source: "User",
        needs_review: false,
        flags: []
    }
])
