module Api
    module V1
        class TransactionsController < ApplicationController
            require "csv"
            protect_from_forgery with: :null_session

            # Transaction params
            def transaction_params
                params.require(:transaction).permit(:date, :description, :amount, :category, :source, :needs_review, flags: [])
            end
            
            # Get all
            def index
                transactions = Transaction.all

                render json: TransactionSerializer.new(transactions).serialized_json
            end

            # Get One
            def show
                transactions = Transaction.find_by(id: params[:id])

                render json: TransactionSerializer.new(transactions).serialized_json
            end

            # create new
            def create
                attrs = transaction_params.to_h

                if attrs[:date].present?
                    attrs[:date] = Date.strptime(attrs[:date], "%Y-%m-%d")
                end

                transaction = Transaction.new(attrs)

                if transaction.save
                    render json: TransactionSerializer.new(transaction).serialized_json
                else 
                    render json: { error: transaction.errors.messages }, status: 422
                end
            end

            # update transaction
            def update
                transaction = Transaction.find_by(id: params[:id])
                Rails.logger.info "transaction_params #{transaction_params}}"
                if transaction.update(transaction_params)
                    render json: TransactionSerializer.new(transaction).serialized_json
                else 
                    render json: { error: transaction.errors.messages }, status: 422
                end
            end

            # delete transaction
            def destroy
                transaction = Transaction.find_by(id: params[:id])

                if transaction.destroy
                    head :no_content
                else 
                    render json: { error: transaction.errors.messages }, status: 422
                end
            end

            # add category to many transactions
            def bulk_categorize
                transaction_ids = params[:transaction_ids]
                category = params[:category]

                if transaction_ids.blank? || !transaction_ids.is_a?(Array)
                return render json: { error: "transaction_ids array is required" }, status: :unprocessable_entity
                end

                if category.blank?
                return render json: { error: "category is required" }, status: :unprocessable_entity
                end

                transactions = Transaction.where(id: transaction_ids)
                transactions.update_all(category: category)

                render json: TransactionSerializer.new(transactions).serialized_json
            end

            # import csv of transactions
            def import_csv
                unless params[:file].present?
                return render json: { error: "CSV file is required" }, status: :unprocessable_entity
                end

                batch_size = 10_000
                rows_to_insert = []

                CSV.foreach(params[:file].path, headers: true) do |row|
                    # Build transaction attributes
                    attrs = {
                        date: row["date"].present? ? Date.strptime(row["date"], "%Y/%m/%d") : nil,
                        description: row["description"],
                        amount: row["amount"].to_f,
                        category: row["category"],
                        source: "csv",
                    }

                    # Apply rules manually (needed to keep batch save)
                    Rule.where(active: true).each do |rule|
                    begin
                        # Evaluate condition in context of attrs hash
                        if eval(rule.condition.gsub(/\bdescription\b/, "attrs[:description]")
                                            .gsub(/\bamount\b/, "attrs[:amount]"))
                        result = eval(rule.action.gsub(/\bflags\b/, "attrs[:flags]"))
                        result.each do |key, value|
                            if key.to_sym == :flags
                            attrs[:flags] = (attrs[:flags] || []) + Array(value)
                            else
                            attrs[key.to_sym] = value
                            end
                        end
                        end
                    rescue => e
                        Rails.logger.error "Rule #{rule.id} failed on row #{row.inspect}: #{e.message}"
                    end
                    end

                    rows_to_insert << attrs

                    # Insert batch if reached batch size
                    if rows_to_insert.size >= batch_size
                        Transaction.insert_all(rows_to_insert)
                        rows_to_insert.clear
                    end
                end

                # Insert remaining rows
                Transaction.insert_all(rows_to_insert) if rows_to_insert.any?

                render json: { message: "CSV imported successfully" }
            rescue => e
                render json: { error: e.message }, status: 422
            end


        end
    end
end
