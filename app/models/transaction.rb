class Transaction < ApplicationRecord
    before_save :apply_rules
    before_save :apply_flags

    private

    # Rules for transactions to apply on save
    def apply_rules
        Rule.where(active: true).each do |rule|
            Rails.logger.info "Applying rule #{rule.id} to transaction #{id || 'new'}"
            begin
            if eval(rule.condition)
                Rails.logger.info "Rule #{rule.id} matched!"
                result = eval(rule.action)
                result.each do |key, value|
                if key.to_sym == :flags
                    self.flags = (self.flags || []) + Array(value)
                else
                    self[key] = value
                end
                end
            end
            rescue => e
            Rails.logger.error "Rule #{rule.id} failed: #{e.message}"
            end
        end
    end

    # Flags for transactions if there is an issue
    def apply_flags
        self.flags ||= []

        # Missing/incomplete metadata
        self.flags << "Missing Description" if description.blank?
        self.flags << "Missing amount" if amount.blank?
        self.flags << "Missing category" if category.blank?

        # Potential duplicates: same date, amount, description
        if Transaction.exists?(date: date, amount: amount, description: description)
        self.flags << "Potential Duplicate"
        end

        # Unusual amounts compared to past behavior
        past_avg = Transaction.where(source: source).average(:amount) || 0
        past_std = Math.sqrt(Transaction.where(source: source).sum { |t| (t.amount - past_avg) ** 2 } / [Transaction.where(source: source).count,1].max)

        # Flag if amount deviates more than 3 std dev from mean
        if past_std > 0 && (amount - past_avg).abs > 3 * past_std
        self.flags << "Unusual Amount"
        end

        # Remove duplicates in flags
        self.flags.uniq!

        self.needs_review = self.flags.any?
    end
end
