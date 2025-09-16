class CreateTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :transactions do |t|
      t.date :date
      t.string :description
      t.decimal :amount, precision: 15, scale: 2 
      t.string :category
      t.string :source
      t.boolean :needs_review, default: false
      t.string :flags, array: true, default: [] 

      t.timestamps
    end
  end
end
