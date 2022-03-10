<template>
  <div class="w-96 bg-gray-800 rounded-2xl text-gray-100">
    <p class="px-4 py-4 text-base">Swap</p>
    <div class="p-4 border-t border-solid border-gray-700">
      <CurrencyInput
        :tokenData="tokenData"
        :currentToken.sync="inputToken"
        :currentAmount.sync="inputAmount"
        @calculatorAmount="updateOutputAmount"
      />
      <button
        @click="swapInputForOutput(inputToken, outputToken)"
        class="text-light-700 p-1.5 rounded-full bg-purple-900 hover:bg-purple-300 hover:text-gray-800 transition-colors my-4"
      >
        <svg
          viewBox="0 0 24 24"
          width="20px"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 5V16.17L6.11997 11.29C5.72997 10.9 5.08997 10.9 4.69997 11.29C4.30997 11.68 4.30997 12.31 4.69997 12.7L11.29 19.29C11.68 19.68 12.31 19.68 12.7 19.29L19.29 12.7C19.68 12.31 19.68 11.68 19.29 11.29C18.9 10.9 18.27 10.9 17.88 11.29L13 16.17V5C13 4.45 12.55 4 12 4C11.45 4 11 4.45 11 5Z"
          ></path>
        </svg>
      </button>
      <CurrencyInput
        :currentToken.sync="outputToken"
        :currentAmount.sync="outputAmount"
        :tokenData="tokenData"
        @calculatorAmount="updateInputAmount"
      />
      <div class="pb-4 flex justify-between items-center mt-2">
        <div class="text-purple-400 text-sm">
          <span v-show="pricePerToken">Price</span>
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm" v-if="isFetching"> Fetching... </span>
          <span class="text-sm" v-else-if="pricePerToken">{{
            pricePerToken
          }}</span>
          <button
            class="p-1 rounded-full bg-gray-900 hover:bg-gray-700 transition-colors"
            @click="fetchTokens"
            :disabled="isFetching"
            :class="{ 'bg-gray-700': isFetching }"
            title="Refresh price"
          >
            <svg
              width="18px"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="m-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 6V7.79C12 8.24 12.54 8.46 12.85 8.14L15.64 5.35C15.84 5.15 15.84 4.84 15.64 4.64L12.85 1.85C12.54 1.54 12 1.76 12 2.21V4C7.58 4 4 7.58 4 12C4 13.04 4.2 14.04 4.57 14.95C4.84 15.62 5.7 15.8 6.21 15.29C6.48 15.02 6.59 14.61 6.44 14.25C6.15 13.56 6 12.79 6 12C6 8.69 8.69 6 12 6ZM17.79 8.71C17.52 8.98 17.41 9.4 17.56 9.75C17.84 10.45 18 11.21 18 12C18 15.31 15.31 18 12 18V16.21C12 15.76 11.46 15.54 11.15 15.86L8.36 18.65C8.16 18.85 8.16 19.16 8.36 19.36L11.15 22.15C11.46 22.46 12 22.24 12 21.8V20C16.42 20 20 16.42 20 12C20 10.96 19.8 9.96 19.43 9.05C19.16 8.38 18.3 8.2 17.79 8.71Z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CurrencyInput from "./currencyInput";
export default {
  name: "SwapCurrency",
  data() {
    return {
      tokenData: [],
      tokenDataUpdateAt: null,
      inputToken: null,
      outputToken: null,
      inputAmount: 0,
      outputAmount: 0,
      isFetching: false,
    };
  },
  components: {
    CurrencyInput,
  },
  computed: {
    pricePerToken() {
      if (
        !this.inputAmount ||
        !this.outputAmount ||
        !this.inputToken ||
        !this.outputToken
      )
        return;
      return `${this.roundingDecimal(this.inputAmount / this.outputAmount)} ${
        this.inputToken.symbol
      } per ${this.outputToken.symbol}`;
    },
  },
  watch: {
    tokenData: {
      handler(v) {
        if (!v) return;
        if (!this.inputToken) this.inputToken = this.pickRandomFromArray(v);
        if (!this.outputToken)
          this.outputToken = this.pickRandomFromArray(
            v.filter((f) => f.symbol != this.inputToken.symbol)
          );
      },
      deep: true,
    },
    /// cover case select same value with output token
    inputToken(newValue, oldValue) {
      if (newValue?.tokenId === this.outputToken?.tokenId) {
        this.inputToken = this.outputToken;
        this.outputToken = oldValue;
        this.updateOutputAmount();
      }
    },
    outputToken(newValue, oldValue) {
      if (newValue?.tokenId === this.inputToken?.tokenId) {
        this.outputToken = this.inputToken;
        this.inputToken = oldValue;
        this.updateInputAmount();
      }
    },
  },
  created() {
    this.fetchTokens();
  },
  methods: {
    updateInputAmount() {
      if (!this.outputAmount) {
        this.outputAmount = this.inputAmount = 0;
        return;
      }
      this.inputAmount = this.roundingDecimal(
        (this.outputAmount * this.outputToken.price) /
        this.inputToken.price
      );
    },
    updateOutputAmount() {
      if (!this.inputAmount) {
        this.outputAmount = this.inputAmount = 0;
        return;
      }
      this.outputAmount = this.roundingDecimal(
        (this.inputAmount * this.inputToken.price) /
        this.outputToken.price
      );
    },
    fetchTokens() {
      this.isFetching = true;
      fetch("https://api.pancakeswap.info/api/v2/tokens")
        .then(async (response) => {
          if (!response.ok) {
            const error = result && result.message;
            return Promise.reject(error);
          }
          const result = await response.json();
          if (this.tokenDataUpdateAt == result.updated_at) return;

          this.tokenDataUpdateAt = result.updated_at;

          this.tokenData = result.data
            ? this.processResponseTokenData(result.data)
            : [];
        })
        .catch((error) => {
          console.error("There was an error!", error);
        })
        .finally(() => {
          this.isFetching = false;
        });
    },
    processResponseTokenData(objectData) {
      return Object.entries(objectData)
        .map(([key, value]) => {
          value.tokenId = key;
          return value;
        })
        .sort(function (a, b) {
          if (a.symbol < b.symbol) {
            return -1;
          }
          if (a.symbol > b.symbol) {
            return 1;
          }
          return 0;
        });
    },
    swapInputForOutput() {
      [this.inputToken, this.outputToken] = [this.outputToken, this.inputToken];
      [this.inputAmount, this.outputAmount] = [this.outputAmount, this.inputAmount];
    },
  },
};
</script>

<style></style>
