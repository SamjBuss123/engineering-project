class TransactionSerializer
  include FastJsonapi::ObjectSerializer
  attributes :date, :description, :amount, :category, :source, :needs_review, :flags
end
