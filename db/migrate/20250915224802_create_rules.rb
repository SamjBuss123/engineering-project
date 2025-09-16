class CreateRules < ActiveRecord::Migration[8.0]
  def change
    create_table :rules do |t|
      t.string :name
      t.text :condition
      t.text :action
      t.boolean :active

      t.timestamps
    end
  end
end
