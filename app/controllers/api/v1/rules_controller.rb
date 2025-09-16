module Api
  module V1
    class RulesController < ApplicationController
      protect_from_forgery with: :null_session

      before_action :set_rule, only: [:show, :update, :destroy]

      # Get all
      def index
        rules = Rule.all
        render json: rules
      end

      # Get one
      def show
        render json: @rule
      end

      # create new
      def create
        rule = Rule.new(rule_params)
        if rule.save
          render json: rule
        else
          render json: { error: rule.errors.messages }, status: 422
        end
      end

      # update rule
      def update
        if @rule.update(rule_params)
          render json: @rule
        else
          render json: { error: @rule.errors.messages }, status: 422
        end
      end

      # Delete rule
      def destroy
        if @rule.destroy
          head :no_content
        else
          render json: { error: @rule.errors.messages }, status: 422
        end
      end

      private

      def set_rule
        @rule = Rule.find_by(id: params[:id])
        render json: { error: "Rule not found" }, status: 404 unless @rule
      end

      def rule_params
        params.require(:rule).permit(:name, :condition, :action, :active)
      end
    end
  end
end
