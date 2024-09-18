const TradeFungibles = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <b-modal ref="modalselloffer" hide-footer header-class="m-0 px-3 py-2" body-class="m-0 p-0" body-bg-variant="light" size="xl">
          <template #modal-title>Trade Fungibles - Maker Sell Offer</template>
          <div class="m-0 p-1">
            <div class="d-flex flex-wrap m-0 p-0">
              <div class="mt-0 ml-2 pr-0">
                <font size="-1">
                  Token Agent:
                </font>
                <b-link v-if="modalSellOffer.tokenAgent" :href="explorer + 'address/' + modalSellOffer.tokenAgent + '#code'" v-b-popover.hover.ds500="'View in explorer'" target="_blank">
                  <b-badge variant="link" class="m-0 mt-1">
                    {{ modalSellOffer.tokenAgent.substring(0, 10) + '...' + modalSellOffer.tokenAgent.slice(-8) }}
                  </b-badge>
                </b-link>
              </div>
              <div class="mt-0 pr-0">
                <font size="-1">
                  Maker:
                </font>
                <b-link v-if="modalSellOffer.maker" :href="explorer + 'address/' + modalSellOffer.maker" v-b-popover.hover.ds500="'View in explorer'" target="_blank">
                  <b-badge variant="link" class="m-0 mt-1">
                    {{ modalSellOffer.maker.substring(0, 10) + '...' + modalSellOffer.maker.slice(-8) }}
                  </b-badge>
                </b-link>
              </div>
              <div class="mt-0 pr-0">
                <font size="-1">
                  {{ settings.symbol }}:
                </font>
                <b-link v-if="modalSellOffer.maker" :href="explorer + 'token/' + settings.tokenContractAddress + '?a=' + modalSellOffer.maker" v-b-popover.hover.ds500="'View in explorer'" target="_blank">
                  <b-badge variant="link" class="m-0 mt-1">
                    {{ formatDecimals(sellOffer.makerTokenBalance, settings.decimals) }}
                  </b-badge>
                </b-link>
              </div>
              <div class="mt-0 pr-0">
                <font size="-1">
                  Approved:
                </font>
                <b-link v-if="modalSellOffer.maker" :href="explorer + 'tx/' + tokenApprovals[modalSellOffer.maker][modalSellOffer.tokenAgent].txHash + '#eventlog#' + tokenApprovals[modalSellOffer.maker][modalSellOffer.tokenAgent].logIndex" v-b-popover.hover.ds500="'View in explorer'" target="_blank">
                  <b-badge variant="link" class="m-0 mt-1">
                    {{ formatDecimals(sellOffer.tokenAgentTokenApproval, settings.decimals) }}
                  </b-badge>
                </b-link>
              </div>
              <div class="mt-0 ml-2 pr-1">
                <font size="-1">
                  Nonce:
                </font>
                <b-badge variant="link" class="m-0 mt-1">
                  {{ sellOffer.nonce }}
                </b-badge>
              </div>
            </div>

            <font size="-1">
              <b-table ref="sellOfferTable" small fixed striped responsive hover sticky-header="400px" selectable select-mode="single" @row-selected='sellOffersRowSelected' :fields="sellOfferFields" :items="sellOffer.prices" show-empty head-variant="light" class="m-0 mt-1">
                <template #cell(price)="data">
                  <font size="-1">
                    {{ formatDecimals(data.item.price, 18) }}
                  </font>
                </template>
                <template #cell(offer)="data">
                  <font size="-1">
                    {{ formatDecimals(data.item.offer, 18) }}
                  </font>
                </template>
                <template #head(tokens)="data">
                  {{ settings.symbol }}
                </template>
                <template #cell(tokens)="data">
                  <font size="-1">
                    {{ formatDecimals(data.item.tokens, 18) }}
                  </font>
                </template>
                <template #head(totalTokens)="data">
                  {{ '∑ ' + settings.symbol }}
                </template>
                <template #cell(totalTokens)="data">
                  <font size="-1">
                    {{ formatDecimals(data.item.totalTokens, 18) }}
                  </font>
                </template>
                <template #head(wethAmount)="data">
                  {{ modalSellOffer.paymentsInEth ? 'ETH' : 'WETH' }}
                </template>
                <template #cell(wethAmount)="data">
                  <font size="-1">
                    {{ formatDecimals(data.item.wethAmount, 18) }}
                  </font>
                </template>
                <template #head(totalWeth)="data">
                  {{ modalSellOffer.paymentsInEth ? '∑ ETH' : '∑ WETH' }}
                </template>
                <template #cell(totalWeth)="data">
                  <font size="-1">
                    {{ formatDecimals(data.item.totalWeth, 18) }}
                  </font>
                </template>
                <template #cell(expiry)="data">
                  <font size="-1">
                    <b-link :href="explorer + 'tx/' + data.item.txHash + '#eventlog#' + data.item.logIndex" v-b-popover.hover.ds500="'View order'" target="_blank">
                      {{ formatTimestamp(data.item.expiry) }}
                    </b-link>
                  </font>
                </template>
              </b-table>
            </font>
            <b-row class="m-0 mt-1 p-0">
              <b-col class="m-0 p-0">
                <b-card sub-title="Requested" class="m-1 p-1 border-1" body-class="m-1 p-1">
                  <b-card-text class="m-0 p-0">
                    <b-form-group label="Token:" label-for="modalselloffer-amounttype" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-radio-group size="sm" id="modalselloffer-amounttype" v-model="modalSellOffer.amountType">
                        <b-form-radio value="receiveTokens">{{ settings.symbol }}</b-form-radio>
                        <b-form-radio value="payWeth">{{ modalSellOffer.paymentsInEth ? 'ETH' : 'WETH' }}</b-form-radio>
                      </b-form-radio-group>
                    </b-form-group>
                    <b-form-group :label="(modalSellOffer.amountType == 'receiveTokens' ? ('Receive ' + settings.symbol) : ('Pay ' + (modalSellOffer.paymentsInEth ? 'ETH' : 'WETH'))) + ':'" label-for="modalselloffer-amount" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" type="number" id="modalselloffer-amount" v-model="modalSellOffer.amount" debounce="600" class="pl-2 w-50"></b-form-input>
                    </b-form-group>
                  </b-card-text>
                </b-card>
                <b-card sub-title="Available" class="m-1 p-1 border-1" body-class="m-1 p-1">
                  <b-card-text class="m-0 p-0">
                    <b-form-group :label="'Receive ' + settings.symbol + ':'" label-for="modalselloffer-filledtokens" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" plaintext id="modalselloffer-filledtokens" :value="sellOffer.filledTokens && formatDecimals(sellOffer.filledTokens, 18)" class="pl-2 w-75"></b-form-input>
                    </b-form-group>
                    <b-form-group :label="'Pay ' + (modalSellOffer.paymentsInEth ? 'ETH:' : 'WETH:')" label-for="modalselloffer-filledweth" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" plaintext id="modalselloffer-filledweth" :value="sellOffer.filledWeth && formatDecimals(sellOffer.filledWeth, 18)" class="pl-2 w-75"></b-form-input>
                    </b-form-group>
                    <b-form-group label="Average Price:" label-for="modalselloffer-filledaverageprice" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" plaintext id="modalselloffer-filledaverageprice" :value="sellOffer.filledAveragePrice && formatDecimals(sellOffer.filledAveragePrice, 18)" class="pl-2 w-75"></b-form-input>
                    </b-form-group>
                  </b-card-text>
                </b-card>
              </b-col>
              <b-col class="m-0 p-0">
                <b-card sub-title="Trade" class="m-1 p-1 border-1" body-class="m-1 p-1">
                  <b-card-text class="m-0 p-0">
                    <b-form-group label="Payments In:" label-for="modalselloffer-paymentsin" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-radio-group size="sm" id="modalselloffer-paymentsin" v-model="modalSellOffer.paymentsInEth" :options="paymentsInEthOptions">
                      </b-form-radio-group>
                    </b-form-group>
                    <b-form-group label="ETH Balance:" label-for="modalselloffer-ethbalance" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" plaintext id="modalselloffer-ethbalance" :value="formatDecimals(balance, 18)" class="pl-2 w-75"></b-form-input>
                    </b-form-group>
                    <b-form-group v-if="!modalSellOffer.paymentsInEth" label="WETH Balance:" label-for="modalselloffer-wethbalance" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" plaintext id="modalselloffer-wethbalance" :value="wethBalances[coinbase] && formatDecimals(wethBalances[coinbase].tokens, 18) || '0'" class="pl-2 w-75"></b-form-input>
                    </b-form-group>
                    <b-form-group v-if="!modalSellOffer.paymentsInEth" label="WETH Approved:" label-for="modalselloffer-wethapproved" label-size="sm" label-cols-sm="4" label-align-sm="right" class="mx-0 my-1 p-0">
                      <b-form-input size="sm" plaintext id="modalselloffer-wethapproved" :value="wethApprovals[coinbase] && wethApprovals[coinbase][sellOffer.tokenAgent] && formatDecimals(wethApprovals[coinbase][sellOffer.tokenAgent].tokens, 18) || '0'" class="pl-2 w-75"></b-form-input>
                    </b-form-group>
                    <b-form-group label="" label-size="sm" label-cols-sm="4" label-align-sm="right" :state="!tradeFeedback" :invalid-feedback="tradeFeedback" class="mx-0 my-1 p-0">
                      <b-button size="sm" :disabled="!networkSupported || !sellOffer.filledTokens || !!tradeFeedback" @click="trade" variant="warning">Trade</b-button>
                    </b-form-group>
                  </b-card-text>
                </b-card>
              </b-col>
            </b-row>
            <!-- <font size="-2">
              <pre>
wethApprovals: {{ wethApprovals }}
wethBalances: {{ wethBalances }}
              </pre>
              <pre>
sellOffer: {{ sellOffer }}
              </pre>
              <pre>
modalSellOffer: {{ modalSellOffer }}
              </pre>
            </font> -->
          </div>
        </b-modal>

        <b-modal ref="modalbuyoffer" hide-footer header-class="m-0 px-3 py-2" body-class="m-0 p-0" body-bg-variant="light" size="lg">
          <template #modal-title>Trade Fungibles - Buy Offer</template>
          <div class="m-0 p-1">
            <b-form-group label="Maker:" label-for="modalbuyoffer-maker" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group style="width: 25.0rem;">
                <b-form-input size="sm" plaintext id="modalbuyoffer-maker" :value="modalBuyOffer.maker" class="pl-2 w-75"></b-form-input>
                <b-input-group-append>
                  <b-button size="sm" :href="explorer + 'address/' + modalBuyOffer.maker" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 mt-1 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-form-group label="Token Agent:" label-for="modalbuyoffer-tokenagent" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group style="width: 25.0rem;">
                <b-form-input size="sm" plaintext id="modalbuyoffer-tokenagent" :value="modalBuyOffer.tokenAgent" class="pl-2 w-75"></b-form-input>
                <b-input-group-append>
                  <b-button size="sm" :href="explorer + 'address/' + modalBuyOffer.tokenAgent + '#code'" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 mt-1 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-form-group label="Timestamp:" label-for="modalbuyoffer-timestamp" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group style="width: 25.0rem;">
                <b-form-input size="sm" plaintext id="modalbuyoffer-timestamp" :value="modalBuyOffer.offer && formatTimestamp(modalBuyOffer.offer.timestamp)" class="pl-2 w-75"></b-form-input>
                <b-input-group-append>
                  <b-button size="sm" :disabled="!modalBuyOffer.offer" :href="explorer + 'tx/' + (modalBuyOffer.offer && modalBuyOffer.offer.txHash || '') + '#eventlog#' + modalBuyOffer.logIndex" variant="link" v-b-popover.hover.ds500="'View transaction in explorer'" target="_blank" class="m-0 mt-1 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
                </b-input-group-append>
              </b-input-group>
            </b-form-group>
            <b-form-group label="Expiry:" label-for="modalbuyoffer-expiry" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group style="width: 25.0rem;">
                <b-form-input size="sm" plaintext id="modalbuyoffer-expiry" :value="modalBuyOffer.expiry == 0 ? 'n/a' : formatTimestamp(modalBuyOffer.expiry)" class="pl-2 w-75"></b-form-input>
              </b-input-group>
            </b-form-group>
            <b-form-group label="Nonce:" label-for="modalbuyoffer-nonce" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-input-group style="width: 25.0rem;">
                <b-form-input size="sm" plaintext id="modalbuyoffer-nonce" :value="modalBuyOffer.offer && modalBuyOffer.offer.nonce" class="pl-2 w-75"></b-form-input>
              </b-input-group>
            </b-form-group>

            <font size="-2">
              <pre>
buyOffer: {{ buyOffer }}
              </pre>
              <pre>
modalBuyOffer: {{ modalBuyOffer }}
              </pre>
            </font>
            <!-- <b-form-group label="New Token Agent" label-size="sm" label-cols-sm="6" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-button size="sm" @click="deployNewTokenAgent" variant="warning">Deploy</b-button>
            </b-form-group> -->
          </div>
        </b-modal>

        <b-tabs card v-model="settings.tabIndex" @input="saveSettings();" content-class="mt-0" align="left">
          <template #tabs-start>
            <div class="d-flex flex-wrap m-0 p-0">
              <div class="mt-0 pr-0" style="width: 24.0rem;">
                <b-form-group label-for="explorer-tokencontractaddress" :state="!settings.tokenContractAddress || validAddress(settings.tokenContractAddress)" :invalid-feedback="'Invalid address'" class="m-0 p-0">
                  <b-form-input type="text" size="sm" id="explorer-tokencontractaddress" v-model="settings.tokenContractAddress" @change="saveSettings(); loadData(settings.tokenContractAddress);" placeholder="Token contract address, or select from dropdown"></b-form-input>
                </b-form-group>
              </div>
              <!-- TODO WIP -->
              <!-- <div class="mt-0 pr-1">
                <b-button size="sm" @click="showModalAddTokenContract" variant="link" v-b-popover.hover.ds500="'WIP: Search for token contracts'"><b-icon-search shift-v="+0" font-scale="1.2"></b-icon-search></b-button>
              </div> -->
              <div class="mt-0 pr-0">
                <b-dropdown size="sm" id="dropdown-left" text="" variant="link" v-b-popover.hover.ds500="'Existing Token Agents'" class="m-0 ml-1 p-0">
                  <b-dropdown-item v-if="tokenContractsDropdownOptions.length == 0" disabled>No Token contracts with transfers permitted</b-dropdown-item>
                  <div v-for="(item, index) of tokenContractsDropdownOptions" v-bind:key="index">
                    <!-- <b-dropdown-item @click="settings.tokenAgentAddress = item.tokenAgent; saveSettings(); loadData(settings.contract);">{{ index }}. {{ 'ERC-' + item.type }} {{ item.contract.substring(0, 8) + '...' + item.contract.slice(-6) + ' ' + item.name }}</b-dropdown-item> -->
                    <b-dropdown-item @click="settings.tokenContractAddress = item.tokenContract; settings.symbol = item.symbol; settings.name = item.name; settings.decimals = item.decimals; saveSettings(); loadData(settings.tokenAgentAddress);">{{ index }}. {{ item.tokenContract.substring(0, 8) + '...' + item.tokenContract.slice(-6) + ' ' + item.symbol + ' ' + item.name + ' ' + (item.decimals != null ? parseInt(item.decimals) : '') }}</b-dropdown-item>
                  </div>
                </b-dropdown>
              </div>
              <div class="mt-0 pr-1">
                <b-button size="sm" :disabled="!validAddress(settings.tokenContractAddress)" :href="explorer + 'address/' + settings.tokenContractAddress + '#code'" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
              </div>
              <div class="mt-0 pr-1">
                <b-button size="sm" :disabled="!networkSupported || sync.completed != null || !validAddress(settings.tokenContractAddress)" @click="loadData(settings.tokenContractAddress);" variant="primary">Retrieve</b-button>
              </div>
              <!-- <div class="mt-0 pr-1">
                <b-button :disabled="!settings.contract || !validAddress(settings.contract)" @click="copyToClipboard(settings.contract);" variant="link" v-b-popover.hover.ds500="'Copy ERC-20 contract address to clipboard'" class="m-0 ml-2 p-0"><b-icon-clipboard shift-v="+1" font-scale="1.1"></b-icon-clipboard></b-button>
              </div> -->
              <div class="mt-0 pr-1" style="width: 23.0rem;">
                <font size="-1">
                  <b-link v-if="false" :href="explorer + 'address/' + settings.tokenAgentOwner" v-b-popover.hover.ds500="'Token Agent owner ' + settings.tokenAgentOwner" target="_blank">
                    <b-badge v-if="settings.tokenAgentOwner" variant="link" class="m-0 mt-1">
                      {{ settings.tokenAgentOwner.substring(0, 10) + '...' + settings.tokenAgentOwner.slice(-8) }}
                    </b-badge>
                  </b-link>
                  <b-badge v-if="false" variant="light" v-b-popover.hover.ds500="'Nonce'" class="m-0 mt-1">
                    {{ nonce }}
                  </b-badge>
                  <b-badge v-if="settings.symbol" variant="light" v-b-popover.hover.ds500="'Symbol'" class="m-0 mt-1">
                    {{ settings.symbol }}
                  </b-badge>
                  <b-badge v-if="settings.name" variant="light" v-b-popover.hover.ds500="'Name'" class="m-0 mt-1">
                    {{ settings.name }}
                  </b-badge>
                  <b-badge v-if="settings.decimals" variant="light" v-b-popover.hover.ds500="'Decimals'" class="m-0 mt-1">
                    {{ settings.decimals }}
                  </b-badge>
                  <!-- <b-badge variant="light" v-b-popover.hover.ds500="contract.decimals != null && contract.totalSupply && ('symbol: ' + contract.symbol + ', name: ' + contract.name + ', decimals: ' + contract.decimals + ', totalSupply: ' + formatDecimals(contract.totalSupply, contract.decimals) + ' (' + formatNumber(contract.totalSupply) + ')') || ''" class="m-0 mt-1 ml-2 mr-1">
                    {{ (contract.contractType && ('ERC-' + contract.contractType) || 'Enter token contract address and click [Retrieve]') }}
                  </b-badge>
                  <b-badge v-if="contract.symbol" variant="light" v-b-popover.hover.ds500="'symbol'" class="m-0 mt-1">
                    {{ contract.symbol }}
                  </b-badge>
                  <b-badge v-if="contract.name" variant="light" v-b-popover.hover.ds500="'name'" class="m-0 mt-1">
                    {{ contract.name }}
                  </b-badge>
                  <b-badge v-if="contract.decimals" variant="light" v-b-popover.hover.ds500="'decimals'" class="m-0 mt-1">
                    {{ contract.decimals }}
                  </b-badge>
                  <b-badge v-if="contract.totalSupply" variant="light" v-b-popover.hover.ds500="'totalSupply ' + (contract.totalSupply && formatNumber(contract.totalSupply) || '')" class="m-0 mt-1">
                    {{ formatDecimals(contract.totalSupply, contract.decimals) }}
                  </b-badge> -->
                </font>
              </div>
            </div>
          </template>
          <b-tab no-body active>
            <template #title>
              <span v-b-popover.hover.ds500="'Current market'">Market</span>
            </template>
          </b-tab>
          <b-tab no-body>
            <template #title>
              <span v-b-popover.hover.ds500="'Trades'">Trades</span>
            </template>
          </b-tab>
          <b-tab no-body>
            <template #title>
              <span v-b-popover.hover.ds500="'Events'">Events</span>
            </template>
          </b-tab>
          <b-tab no-body>
            <template #title>
              <span v-b-popover.hover.ds500="'Raw command console'">Console</span>
            </template>
          </b-tab>
        </b-tabs>

        <b-card v-if="settings.tabIndex == 0" class="m-0 p-0 border-0" body-class="m-0 p-0">
          <b-row class="m-0 p-0">
            <b-col class="m-0 mr-1 p-0">
              <div class="d-flex flex-wrap m-0 mt-1 p-0">
                <div class="mt-1 pr-1">
                  Taker Buy / Maker Sell
                </div>
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pr-1">
                  <b-form-select size="sm" v-model="settings.sellOffers.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
                </div>
                <div class="mt-0 pr-1">
                  <font size="-2" v-b-popover.hover.ds500="'# filtered / all entries'">{{ filteredSortedSellOffers.length + '/' + sellOffers.length }}</font>
                </div>
                <div class="mt-0 pr-1">
                  <b-pagination size="sm" v-model="settings.sellOffers.currentPage" @input="saveSettings" :total-rows="filteredSortedSellOffers.length" :per-page="settings.sellOffers.pageSize" style="height: 0;"></b-pagination>
                </div>
                <div class="mt-0 pl-1">
                  <b-form-select size="sm" v-model="settings.sellOffers.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
                </div>
              </div>
              <font size="-1">
                <b-table ref="sellOffersTable" small fixed striped responsive hover sticky-header="400px" selectable select-mode="single" @row-selected='sellOffersRowSelected' :fields="sellOffersFields" :items="pagedFilteredSellOffers" show-empty head-variant="light" class="m-0 mt-1">
                  <template #cell(number)="data">
                    <font size="-1">
                      {{ parseInt(data.index) + ((settings.sellOffers.currentPage - 1) * settings.sellOffers.pageSize) + 1 }}
                    </font>
                  </template>
                  <template #cell(expiry)="data">
                    <font size="-1">
                      {{ formatTimestamp(data.item.expiry) }}
                    </font>
                    <!-- <font size="-1">
                      {{ data.item.tokenAgent.substring(0, 6) + '...' + data.item.tokenAgent.slice(-4) + ':' + data.item.tokenAgentIndexByOwner }}
                    </font> -->
                  </template>
                  <template #cell(maker)="data">
                    <font size="-1">
                      <b-link size="sm" :href="explorer + 'token/' + settings.tokenContractAddress + '?a=' + data.item.maker" variant="link" v-b-popover.hover.ds500="data.item.maker" target="_blank">
                        {{ data.item.maker.substring(0, 8) + '...' + data.item.maker.slice(-6) }}
                      </b-link>
                      <b-badge variant="light" v-b-popover.hover.ds500="'Owners token agent #' + data.item.tokenAgentIndexByOwner + ' ' + data.item.tokenAgent" class="m-0 p-0">
                        {{ data.item.tokenAgentIndexByOwner }}
                      </b-badge>
                      <b-badge variant="light" v-b-popover.hover.ds500="'Offer index ' + data.item.offerIndex" class="m-0 p-0">
                        {{ data.item.offerIndex }}
                      </b-badge>
                      <b-badge variant="light" v-b-popover.hover.ds500="'Price index ' + data.item.priceIndex" class="m-0 p-0">
                        {{ data.item.priceIndex }}
                      </b-badge>
                    </font>
                  </template>
                  <template #cell(tokens)="data">
                    <font size="-1">
                      {{ formatDecimals(data.item.tokensAvailable, 18) }}
                    </font>
                  </template>
                  <template #cell(price)="data">
                    <font size="-1">
                      {{ formatDecimals(data.item.price, 18) }}
                    </font>
                  </template>
                </b-table>
              </font>

            </b-col>
            <b-col class="m-0 ml-1 p-0">
              <div class="d-flex flex-wrap m-0 mt-1 p-0">
                <div class="mt-1 pr-1">
                  Taker Sell / Maker Buy
                </div>
                <div class="mt-0 flex-grow-1">
                </div>
                <div class="mt-0 pr-1">
                  <b-form-select size="sm" v-model="settings.buyOffers.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
                </div>
                <div class="mt-0 pr-1">
                  <font size="-2" v-b-popover.hover.ds500="'# filtered / all entries'">{{ filteredSortedBuyOffers.length + '/' + buyOffers.length }}</font>
                </div>
                <div class="mt-0 pr-1">
                  <b-pagination size="sm" v-model="settings.buyOffers.currentPage" @input="saveSettings" :total-rows="filteredSortedBuyOffers.length" :per-page="settings.buyOffers.pageSize" style="height: 0;"></b-pagination>
                </div>
                <div class="mt-0 pl-1">
                  <b-form-select size="sm" v-model="settings.buyOffers.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
                </div>
              </div>
              <font size="-1">
                <b-table ref="buyOffersTable" small fixed striped responsive hover sticky-header="400px" selectable select-mode="single" @row-selected='buyOffersRowSelected' :fields="buyOffersFields" :items="pagedFilteredBuyOffers" show-empty head-variant="light" class="m-0 mt-1">
                  <template #cell(price)="data">
                    <font size="-1">
                      {{ formatDecimals(data.item.price, 18) }}
                    </font>
                  </template>
                  <template #cell(tokens)="data">
                    <font size="-1">
                      {{ formatDecimals(data.item.tokensAvailable, 18) }}
                    </font>
                  </template>
                  <template #cell(maker)="data1">
                    <font size="-1">
                      <b-link size="sm" :href="explorer + 'token/' + data.weth + '?a=' + data1.item.maker" variant="link" v-b-popover.hover.ds500="data1.item.maker" target="_blank">
                        {{ data1.item.maker.substring(0, 8) + '...' + data1.item.maker.slice(-6) }}
                      </b-link>
                      <b-badge variant="light" v-b-popover.hover.ds500="'Owners token agent #' + data1.item.tokenAgentIndexByOwner + ' ' + data1.item.tokenAgent" class="m-0 p-0">
                        {{ data1.item.tokenAgentIndexByOwner }}
                      </b-badge>
                      <b-badge variant="light" v-b-popover.hover.ds500="'Offer index ' + data1.item.offerIndex" class="m-0 p-0">
                        {{ data1.item.offerIndex }}
                      </b-badge>
                      <b-badge variant="light" v-b-popover.hover.ds500="'Price index ' + data1.item.priceIndex" class="m-0 p-0">
                        {{ data1.item.priceIndex }}
                      </b-badge>
                    </font>
                  </template>
                  <template #cell(expiry)="data">
                    <font size="-1">
                      {{ formatTimestamp(data.item.expiry) }}
                    </font>
                  </template>
                  <template #cell(number)="data">
                    <font size="-1">
                      {{ parseInt(data.index) + ((settings.buyOffers.currentPage - 1) * settings.buyOffers.pageSize) + 1 }}
                    </font>
                  </template>
                </b-table>
              </font>
            </b-col>
          </b-row>
          <b-row class="m-0 mt-2 p-0">
            <b-col class="m-0 mr-1 p-0">
              <font size="-2">
                <pre>
sellOffers: {{ sellOffers }}
                </pre>
              </font>
            </b-col>
            <b-col class="m-0 mr-1 p-0">
              <font size="-2">
                <pre>
buyOffers: {{ buyOffers }}
                </pre>
              </font>
            </b-col>
          </b-row>
        </b-card>

        <font v-if="settings.tabIndex == 1 || settings.tabIndex == 2 || settings.tabIndex == 3" size="-2">
          <pre>
data: {{ data }}
          </pre>
        </font>

      </b-card>
    </div>
  `,
  data: function () {
    return {
      count: 0,
      reschedule: true,
      settings: {
        tabIndex: 0,

        tokenContractAddress: null,
        symbol: null,
        name: null,
        decimals: null,

        sellOffers: {
          filter: null,
          currentPage: 1,
          pageSize: 10,
          sortOption: 'txorderdsc',
        },
        buyOffers: {
          filter: null,
          currentPage: 1,
          pageSize: 10,
          sortOption: 'txorderdsc',
        },

        tokenAgentAddress: null,
        tokenAgentOwner: null,
        addOffers: {
          offers: [],
          token: null,
          type: null,
          symbol: null,
          decimals: null,
          buySell: 0,
          expiry: null,
          count: null,
          pricing: 0,
          price: null,
          tokens: null,
          prices: [],
          tokenIds: [],
          tokenss: [],
        },

        version: 5,
      },

      tokenAgentFactoryEvents: [],

      data: {
        chainId: null,
        blockNumber: null,
        timestamp: null,
        token: null,
        weth: null,
        tokenAgents: {},
        tokenAgentEvents: [],
        // buyEvents: [], // TODO: delete
        // sellEvents: [], // TODO: delete
        approvalAddresses: [],
        balanceAddresses: [],
        tokenApprovals: [],
        wethApprovals: [],
        tokenTransfers: [],
        wethTransfers: [],
      },

      sellByMakers: {},
      buyByMakers: {},

      tokenBalances: {},
      wethBalances: {},
      tokenApprovals: {},
      wethApprovals: {},

      modalSellOffer: {
        // amount: "0.12345123", // null,
        amount: "0.10345123", // null,
        amountType: 'payWeth', // 'receiveTokens' or 'payWeth'

        paymentsInEth: false,

        txHash: null,
        logIndex: null,
        maker: null,
        tokenAgent: null,
        tokenAgentIndexByOwner: null,
        offerIndex: null,
        priceIndex: null,
        price: null,
        tokens: null,
        expiry: null,
        offer: null,
      },
      modalBuyOffer: {
        txHash: null,
        logIndex: null,
        maker: null,
        tokenAgent: null,
        tokenAgentIndexByOwner: null,
        offerIndex: null,
        priceIndex: null,
        price: null,
        tokens: null,
        expiry: null,
        offer: null,
      },

      events: [],
      approvals: [],

      buySellOptions: [
        { value: 0, text: 'Buy' },
        { value: 1, text: 'Sell' },
      ],
      pricing20Options: [
        { value: 0, text: 'Single price without limit' },
        { value: 1, text: 'Single price with limit' },
        { value: 1, text: 'Multiple prices and limits', disabled: true },
      ],
      paymentsInEthOptions: [
        { text: 'WETH', value: false },
        { text: 'ETH', value: true },
      ],
      sortOptions: [
        { value: 'txorderasc', text: '▲ TxOrder' },
        { value: 'txorderdsc', text: '▼ TxOrder' },
        // { value: 'ownertokenagentasc', text: '▲ Owner, ▲ Token Agent' },
        // { value: 'ownertokenagentdsc', text: '▼ Owner, ▲ Token Agent' },
        // { value: 'tokenagentasc', text: '▲ Token Agent' },
        // { value: 'tokenagentdsc', text: '▼ Token Agent' },
        // TODO: Deploy new TokenContractFactory with index worked out
        // { value: 'indexasc', text: '▲ Index' },
        // { value: 'indexdsc', text: '▼ Index' },
      ],
      sellOfferFields: [
        // { key: 'nonce', label: 'Nonce', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'price', label: 'Price', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'offer', label: 'Offered', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'totalTokens', label: '∑ Tokens', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'wethAmount', label: '[W]ETH', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'totalWeth', label: '∑ [W]ETH', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'maker', label: 'Maker', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'tokenType', label: 'Type', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'buySell', label: 'B/S', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
      ],
      sellOffersFields: [
        // { key: 'nonce', label: 'Nonce', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'maker', label: 'Maker', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'price', label: 'Price', sortable: false, thStyle: 'width: 20%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'tokenType', label: 'Type', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'buySell', label: 'B/S', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
      ],
      buyOffersFields: [
        { key: 'price', label: 'Price', sortable: false, thStyle: 'width: 20%;', tdClass: 'text-left' },
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
        { key: 'maker', label: 'Maker', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 25%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'tokenType', label: 'Type', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'buySell', label: 'B/S', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'nonce', label: 'Nonce', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
    },
    coinbase() {
      return store.getters['connection/coinbase'];
    },
    balance() {
      return store.getters['connection/balance'];
    },
    networkSupported() {
      return store.getters['connection/networkSupported'];
    },
    transferHelper() {
      return store.getters['connection/transferHelper'];
    },
    explorer() {
      return store.getters['connection/explorer'];
    },
    addresses() {
      return store.getters['data/addresses'];
    },
    tokenAgents() {
      return store.getters['data/tokenAgents'];
    },
    tokenContracts() {
      return store.getters['data/tokenContracts'];
    },
    names() {
      return store.getters['data/names'];
    },
    sync() {
      return store.getters['data/sync'];
    },
    pageSizes() {
      return store.getters['config/pageSizes'];
    },
    registry() {
      return store.getters['data/registry'];
    },

    tokenAgentsDropdownOptions() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [tokenAgent, d] of Object.entries(this.tokenAgents[this.chainId] || {})) {
        results.push({ tokenAgent, owner: d.owner, index: d.index });
      }
      // console.log(now() + " INFO TradeFungibles:computed.tokenAgentsDropdownOptions - results[0..9]: " + JSON.stringify(this.filteredSortedItems.slice(0, 10), null, 2));
      return results;
    },

    tokenContractsDropdownOptions() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [tokenContract, d] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (d.transfers) {
          results.push({ tokenContract, type: d.type, symbol: d.symbol, name: d.name, decimals: d.decimals });
        }
      }
      return results;
    },

    tradeFeedback() {
      console.log(now() + " INFO TradeFungibles:computed.tradeFeedback");
      // if (this.coinbase == this.sellOffer.maker) {
      //   return "Cannot self trade";
      // }
      const filledWeth = ethers.BigNumber.from(this.sellOffer.filledWeth || 0);
      if (this.modalSellOffer.paymentsInEth) {
        const balance = ethers.BigNumber.from(this.balance);
        if (balance.lt(filledWeth)) {
          return "Insufficient ETH balance"
        }
      } else {
        const wethBalance = ethers.BigNumber.from(this.wethBalances[this.coinbase] && this.wethBalances[this.coinbase].tokens || 0);
        if (wethBalance.lt(filledWeth)) {
          return "Insufficient WETH balance"
        }
        const wethApproved = ethers.BigNumber.from(this.wethApprovals[this.coinbase] && this.wethApprovals[this.coinbase][this.sellOffer.tokenAgent] && this.wethApprovals[this.coinbase][this.sellOffer.tokenAgent].tokens || 0);
        if (wethApproved.lt(filledWeth)) {
          return "Insufficient WETH approved to Token Agent"
        }
      }
      return null;
    },

    addOffersFeedback() {
      if (!this.settings.tokenAgentAddress || !this.validAddress(this.settings.tokenAgentAddress)) {
        return "Enter token agent address";
      }
      if (!this.settings.addOffers.token || !this.validAddress(this.settings.addOffers.token)) {
        return "Enter token contract address";
      }
      if (this.settings.addOffers.type == 20) {
        if (this.settings.addOffers.pricing == 0) {
          if (this.validNumber(this.settings.addOffers.price, 18)) {
            return null;
          } else {
            return "Invalid price";
          }
        }
        if (this.settings.addOffers.pricing == 1) {
          if (this.validNumber(this.settings.addOffers.price, 18)) {
          } else {
            return "Invalid price";
          }
          if (this.validNumber(this.settings.addOffers.tokens, this.settings.addOffers.decimals)) {
            return null;
          } else {
            return "Invalid tokens";
          }
        }
        return "Only single price with or without tokens limit supported"
      } else if (this.settings.addOffers.type == 721 || this.settings.addOffers.type == 1155) {
        return "ERC-721/1155 not supported yet";
      }
      return null;
    },

    nonce() {
      const events = this.events.filter(e => e.eventType == "OffersInvalidated");
      if (events.length > 0) {
        return events[events.length - 1].newNonce;
      }
      return 0;
    },

    sellOffers() {
      const results = [];
      console.log(now() + " INFO TradeFungibles:computed.sellOffers - this.sellByMakers: " + JSON.stringify(this.sellByMakers, null, 2));
      const collator = {};
      for (const [tokenAgent, d] of Object.entries(this.data.tokenAgents)) {
        if (!(d.owner in collator)) {
          collator[d.owner] = {
            tokenBalance: this.tokenBalances[d.owner] && this.tokenBalances[d.owner].tokens || 0,
            tokenAgents: {},
          };
        }
        collator[d.owner].tokenAgents[tokenAgent] = {
          tokenApproval: this.tokenApprovals[d.owner] && this.tokenApprovals[d.owner][tokenAgent] && this.tokenApprovals[d.owner][tokenAgent].tokens || 0,
          offers: {},
          prices: [],
        };
        const prices = [];
        for (const [offerIndex, o] of Object.entries(d.offers)) {
          if (d.nonce == o.nonce && (o.expiry == 0 || o.expiry > this.data.timestamp) && o.buySell == 1) {
            collator[d.owner].tokenAgents[tokenAgent].offers[offerIndex] = o;
            if (o.prices.length == 1 && o.tokenss.length == 0) {
              prices.push({ offerIndex: o.index, priceIndex: 0, price: o.prices[0], tokens: null });
            } else if (o.prices.length == o.tokenss.length) {
              for (let i = 0; i < o.prices.length; i++) {
                prices.push({ offerIndex: o.index, priceIndex: i, price: o.prices[i], tokens: o.tokenss[i], tokensAvailable: null });
              }
            }
          }
        }
        prices.sort((a, b) => {
          const aP = ethers.BigNumber.from(a.price);
          // TODO: handle null tokens
          const aT = a.tokens != null && ethers.BigNumber.from(a.tokens) || null;
          const bP = ethers.BigNumber.from(b.price);
          const bT = b.tokens != null && ethers.BigNumber.from(b.tokens) || null;
          if (aP.eq(bP)) {
            if (aT == null) {
              return 1;
            } else if (bT == null) {
              return -1;
            } else {
              return aT.lt(bT) ? 1 : -1;
            }
          } else {
            return aP.lt(bP) ? -1 : 1;
          }
        });
        const tokenBalance = ethers.BigNumber.from(collator[d.owner].tokenBalance);
        const tokenApproval = ethers.BigNumber.from(collator[d.owner].tokenAgents[tokenAgent].tokenApproval);
        let tokensRemaining = tokenBalance.lte(tokenApproval) ? tokenBalance: tokenApproval;
        console.log(now() + " INFO TradeFungibles:computed.sellOffers - maker: " + d.owner.substring(0, 10) + ", tokenAgent: " + tokenAgent.substring(0, 10) + ", tokenBalance: " + ethers.utils.formatEther(tokenBalance) + ", tokenApproval: " + ethers.utils.formatEther(tokenApproval) + ", tokensRemaining: " + ethers.utils.formatEther(tokensRemaining));
        for (const [i, e] of prices.entries()) {
          const tokens = ethers.BigNumber.from(e.tokens);
          const tokensAvailable = tokens.lte(tokensRemaining) ? tokens : tokensRemaining;
          tokensRemaining = tokensRemaining.sub(tokensAvailable);
          console.log("    offerIndex: " + e.offerIndex + ", priceIndex: " + e.priceIndex + ", price: " + ethers.utils.formatEther(e.price) +
            ", tokens: " + ethers.utils.formatEther(tokens) +
            ", tokensAvailable: " + ethers.utils.formatEther(tokensAvailable) +
            ", tokensRemaining: " + ethers.utils.formatEther(tokensRemaining)
          );
          prices[i].tokensAvailable = tokensAvailable.toString();
          // if (tokensAvailable.gt(0)) {
            const o = d.offers[e.offerIndex];
            results.push({
              txHash: o.txHash, logIndex: o.logIndex, maker: d.owner, tokenAgent,
              tokenAgentIndexByOwner: this.data.tokenAgents[tokenAgent].indexByOwner,
              offerIndex: e.offerIndex, priceIndex: e.priceIndex, price: e.price, tokens: tokens.toString(), tokensAvailable: tokensAvailable.toString(),
              expiry: o.expiry,
            });
          // }
        }
        collator[d.owner].tokenAgents[tokenAgent].prices = prices;
      }
      // console.log(now() + " INFO TradeFungibles:computed.sellOffers - collator: " + JSON.stringify(collator, null, 2));
      // console.log(now() + " INFO TradeFungibles:computed.sellOffers - results: " + JSON.stringify(results, null, 2));
      return results;
    },
    filteredSortedSellOffers() {
      const results = this.sellOffers;
      // if (this.settings.events.sortOption == 'txorderasc') {
      //   results.sort((a, b) => {
      //     if (a.blockNumber == b.blockNumber) {
      //       return a.logIndex - b.logIndex;
      //     } else {
      //       return a.blockNumber - b.blockNumber;
      //     }
      //   });
      // } else if (this.settings.events.sortOption == 'txorderdsc') {
      //   results.sort((a, b) => {
      //     if (a.blockNumber == b.blockNumber) {
      //       return b.logIndex - a.logIndex;
      //     } else {
      //       return b.blockNumber - a.blockNumber;
      //     }
      //   });
      // }
      return results;
    },
    pagedFilteredSellOffers() {
      // console.log(now() + " INFO TradeFungibles:computed.pagedFilteredSellOffers - results[0..1]: " + JSON.stringify(this.filteredSortedSellOffers.slice(0, 2), null, 2));
      return this.filteredSortedSellOffers.slice((this.settings.sellOffers.currentPage - 1) * this.settings.sellOffers.pageSize, this.settings.sellOffers.currentPage * this.settings.sellOffers.pageSize);
    },

    buyOffers() {
      const TENPOW18 = ethers.BigNumber.from("1000000000000000000");
      const results = [];
      console.log(now() + " INFO TradeFungibles:computed.buyOffers - this.buyByMakers: " + JSON.stringify(this.buyByMakers, null, 2));
      const collator = {};
      for (const [tokenAgent, d] of Object.entries(this.data.tokenAgents)) {
        if (!(d.owner in collator)) {
          collator[d.owner] = {
            wethBalance: this.wethBalances[d.owner] && this.wethBalances[d.owner].tokens || 0,
            tokenAgents: {},
          };
        }
        collator[d.owner].tokenAgents[tokenAgent] = {
          wethApproval: this.wethApprovals[d.owner] && this.wethApprovals[d.owner][tokenAgent] && this.wethApprovals[d.owner][tokenAgent].tokens || 0,
          offers: {},
          prices: [],
        };
        const prices = [];
        for (const [offerIndex, o] of Object.entries(d.offers)) {
          if (d.nonce == o.nonce && (o.expiry == 0 || o.expiry > this.data.timestamp) && o.buySell == 0) {
            collator[d.owner].tokenAgents[tokenAgent].offers[offerIndex] = o;
            if (o.prices.length == 1 && o.tokenss.length == 0) {
              prices.push({ offerIndex: o.index, priceIndex: 0, price: o.prices[0], tokens: null });
            } else {
              for (let i = 0; i < o.prices.length; i++) {
                prices.push({ offerIndex: o.index, priceIndex: i, price: o.prices[i], tokens: o.tokenss[i], tokensAvailable: null });
              }
            }
          }
        }
        prices.sort((a, b) => {
          const aP = ethers.BigNumber.from(a.price);
          // TODO: handle null tokens
          const aT = a.tokens != null && ethers.BigNumber.from(a.tokens) || null;
          const bP = ethers.BigNumber.from(b.price);
          const bT = b.tokens != null && ethers.BigNumber.from(b.tokens) || null;
          if (aP.eq(bP)) {
            if (aT == null) {
              return 1;
            } else if (bT == null) {
              return -1;
            } else {
              return aT.lt(bT) ? 1 : -1;
            }
          } else {
            return aP.lt(bP) ? 1 : -1;
          }
        });
        const wethBalance = ethers.BigNumber.from(collator[d.owner].wethBalance);
        // const wethBalance = ethers.BigNumber.from("100000000000000003");
        const wethApproval = ethers.BigNumber.from(collator[d.owner].tokenAgents[tokenAgent].wethApproval);
        let wethRemaining = wethBalance.lte(wethApproval) ? wethBalance: wethApproval;
        console.log(now() + " INFO TradeFungibles:computed.buyOffers - maker: " + d.owner.substring(0, 10) + ", tokenAgent: " + tokenAgent.substring(0, 10) + ", wethBalance: " + ethers.utils.formatEther(wethBalance) + ", wethApproval: " + ethers.utils.formatEther(wethApproval) + ", wethRemaining: " + ethers.utils.formatEther(wethRemaining));
        for (const [i, e] of prices.entries()) {
          const tokens = ethers.BigNumber.from(e.tokens);
          const tokensRemaining = wethRemaining.mul(TENPOW18).div(e.price);
          const tokensAvailable = tokens.lte(tokensRemaining) ? tokens : tokensRemaining;
          const wethAvailable = tokensAvailable.mul(ethers.BigNumber.from(e.price)).div(TENPOW18);
          wethRemaining = wethRemaining.sub(wethAvailable);
          console.log("    offerIndex: " + e.offerIndex + ", priceIndex: " + e.priceIndex + ", price: " + ethers.utils.formatEther(e.price) +
            ", tokens: " + ethers.utils.formatEther(tokens) +
            ", tokensAvailable: " + ethers.utils.formatEther(tokensAvailable) +
            ", wethRemaining: " + ethers.utils.formatEther(wethRemaining)
          );
          prices[i].tokensAvailable = tokensAvailable.toString();
          if (tokensAvailable.gt(0)) {
            const o = d.offers[e.offerIndex];
            results.push({
              txHash: o.txHash, logIndex: o.logIndex, maker: d.owner, tokenAgent,
              tokenAgentIndexByOwner: this.data.tokenAgents[tokenAgent].indexByOwner,
              offerIndex: e.offerIndex, priceIndex: e.priceIndex, price: e.price, tokens: tokens.toString(), tokensAvailable: tokensAvailable.toString(),
              expiry: o.expiry,
            });
          }
        }
        collator[d.owner].tokenAgents[tokenAgent].prices = prices;
      }
      // console.log(now() + " INFO TradeFungibles:computed.buyOffers - collator: " + JSON.stringify(collator, null, 2));
      return results;
    },
    filteredSortedBuyOffers() {
      const results = this.buyOffers;
      // if (this.settings.events.sortOption == 'txorderasc') {
      //   results.sort((a, b) => {
      //     if (a.blockNumber == b.blockNumber) {
      //       return a.logIndex - b.logIndex;
      //     } else {
      //       return a.blockNumber - b.blockNumber;
      //     }
      //   });
      // } else if (this.settings.events.sortOption == 'txorderdsc') {
      //   results.sort((a, b) => {
      //     if (a.blockNumber == b.blockNumber) {
      //       return b.logIndex - a.logIndex;
      //     } else {
      //       return b.blockNumber - a.blockNumber;
      //     }
      //   });
      // }
      return results;
    },
    pagedFilteredBuyOffers() {
      // console.log(now() + " INFO TradeFungibles:computed.pagedFilteredBuyOffers - results[0..1]: " + JSON.stringify(this.filteredSortedBuyOffers.slice(0, 2), null, 2));
      return this.filteredSortedBuyOffers.slice((this.settings.buyOffers.currentPage - 1) * this.settings.buyOffers.pageSize, this.settings.buyOffers.currentPage * this.settings.buyOffers.pageSize);
    },

    sellOffer() {
      console.log(now() + " INFO TradeFungibles:computed.sellOffer - amount: " + this.modalSellOffer.amount + ", amountType: " + this.modalSellOffer.amountType);
      const TENPOW18 = ethers.BigNumber.from("1000000000000000000");
      // TODO: handle decimals
      let maxTokens = this.modalSellOffer.amount != null && this.modalSellOffer.amount.trim().length != 0 && this.modalSellOffer.amountType == 'receiveTokens' ? ethers.utils.parseEther(this.modalSellOffer.amount) : null;
      let maxWeth = this.modalSellOffer.amount != null && this.modalSellOffer.amount.trim().length != 0 && this.modalSellOffer.amountType == 'payWeth' ? ethers.utils.parseEther(this.modalSellOffer.amount) : null;
      const maker = this.modalSellOffer.maker;
      const makerTokenBalance = maker && this.tokenBalances[maker] && this.tokenBalances[maker].tokens && ethers.BigNumber.from(this.tokenBalances[maker].tokens) || 0;
      // const makerTokenBalance = ethers.BigNumber.from("5100000000000000000");
      const tokenAgent = maker && this.modalSellOffer.tokenAgent || null;
      const tokenAgentTokenApproval = maker && this.tokenApprovals[maker] && this.tokenApprovals[maker][tokenAgent] && ethers.BigNumber.from(this.tokenApprovals[maker][tokenAgent].tokens) || 0;
      const nonce = maker && parseInt(this.data.tokenAgents[tokenAgent].nonce) || 0;
      const offers = maker && this.data.tokenAgents[tokenAgent].offers || [];
      const trades = [];
      const prices = [];
      let filledTokens = null;
      let filledWeth = null;
      let filledAveragePrice = null;
      if (maker) {
        console.log(now() + " INFO Addresses:methods.sellOffer maker: " + maker + ", makerTokenBalance: " + ethers.utils.formatEther(makerTokenBalance) + ", tokenAgent: " + tokenAgent + ", tokenAgentTokenApproval: " + ethers.utils.formatEther(tokenAgentTokenApproval) + ", nonce: " + nonce);
        let totalTokens = ethers.BigNumber.from(0);
        let totalWeth = ethers.BigNumber.from(0);
        for (const [offerIndex, o] of Object.entries(offers)) {
          console.log(now() + " INFO TradeFungibles:computed.sellOffer - offerIndex: " + offerIndex + ", o: " + JSON.stringify(o, null, 2));
          if (nonce == o.nonce && (o.expiry == 0 || o.expiry > this.data.timestamp) && o.buySell == 1) {
            // if (o.prices.length == 1 && o.tokenss.length == 0) {
            //   prices.push({
            //     offerIndex: o.index, priceIndex: 0, price: o.prices[0], offer: null, tokens: null, wethAmount: null, totalTokens: null, totalWeth: null, tokensRemaining: null,
            //     expiry: o.expiry,
            //     txHash: o.txHash,
            //     logIndex: o.logIndex,
            //     selected: this.modalSellOffer.offerIndex == o.index && this.modalSellOffer.priceIndex == 0,
            //   });
            // } else
            if (o.prices.length == o.tokenss.length) {
              for (let i = 0; i < o.prices.length; i++) {
                prices.push({
                  offerIndex: o.index, priceIndex: i, price: o.prices[i], offer: o.tokenss[i], tokens: null, wethAmount: null, totalTokens: null, totalWeth: null, tokensRemaining: null,
                  expiry: o.expiry,
                  txHash: o.txHash,
                  logIndex: o.logIndex,
                  selected: this.modalSellOffer.offerIndex == o.index && this.modalSellOffer.priceIndex >= i,
                });
              }
            }
          }
        }

        prices.sort((a, b) => {
          const aP = ethers.BigNumber.from(a.price);
          const aT = a.offer != null && ethers.BigNumber.from(a.offer) || null;
          const bP = ethers.BigNumber.from(b.price);
          const bT = b.offer != null && ethers.BigNumber.from(b.offer) || null;
          if (aP.eq(bP)) {
            if (aT == null) {
              return 1;
            } else if (bT == null) {
              return -1;
            } else {
              return aT.lt(bT) ? 1 : -1;
            }
          } else {
            return aP.lt(bP) ? -1 : 1;
          }
        });

        // console.log(now() + " INFO Addresses:methods.sellOffer prices: " + JSON.stringify(prices));
        console.log(now() + " INFO Addresses:methods.sellOffer maxTokens: " + (maxTokens && ethers.utils.formatEther(maxTokens) || null) + ", maxWeth: " + (maxWeth && ethers.utils.formatEther(maxWeth) || null));
        let tokensRemaining = makerTokenBalance.lte(tokenAgentTokenApproval) ? makerTokenBalance: tokenAgentTokenApproval;
        console.log(now() + " INFO Addresses:methods.sellOffer tokensRemaining: " + ethers.utils.formatEther(tokensRemaining));
        console.log("offIx pIx           price           offer                  tokens             total tokens                  weth               total weth" + padLeft(maxWeth != null ? "requestd weth remaining" : "requestd tokens remaining", 26));
        console.log("----- --- --------------- --------------- ----------------------- ----------------------- ----------------------- ----------------------- -------------------------");
        for (const [i, e] of prices.entries()) {
          const offer = ethers.BigNumber.from(e.offer);
          let tokens = offer.lte(tokensRemaining) ? offer : tokensRemaining;
          if (maxTokens != null) {
            if (tokens.gt(maxTokens)) {
              tokens = maxTokens;
            }
            maxTokens = maxTokens.sub(tokens);
          }
          let wethAmount = tokens.mul(ethers.BigNumber.from(e.price)).div(TENPOW18);
          if (maxWeth != null) {
            console.log("tokens: " + ethers.utils.formatEther(tokens) + ", e.price: " + ethers.utils.formatEther(e.price) + ", wethAmount: " + ethers.utils.formatEther(wethAmount));
            // tokensRemaining = maxWeth * 10**18 / e.price
            const maxTokensFromWeth = maxWeth.mul(TENPOW18).div(e.price);
            console.log("maxWeth: " + ethers.utils.formatEther(maxWeth) + ", maxTokensFromWeth: " + ethers.utils.formatEther(maxTokensFromWeth));
            if (tokens.gt(maxTokensFromWeth)) {
              wethAmount = maxWeth;
              // wethAmount = maxTokensFromWeth * e.price / 10**18
              // wethAmount = maxTokensFromWeth.mul(ethers.BigNumber.from(e.price)).div(TENPOW18);
              // console.log("wethAmount: " + ethers.utils.formatEther(wethAmount));
              // if (wethAmount.gt(0)) {
                tokens = maxTokensFromWeth;
                console.log("tokens A: " + ethers.utils.formatEther(tokens));
              // } else {
              //   tokens = ethers.BigNumber.from(0);
              //   wethAmount = ethers.BigNumber.from(0);
              //   console.log("tokens B: " + ethers.utils.formatEther(tokens));
              // }
            }
            maxWeth = maxWeth.sub(wethAmount);
          }
          if (tokens.gt(0)) {
            // Trades[]
            // function trade(TradeInput[] calldata inputs, PaymentType paymentType) external payable nonReentrant notOwner {
            // enum Execution { FILL, FILLORKILL }
            // enum PaymentType { WETH, ETH }
            // struct TradeInput {
            //     Index index;             // 32 bits
            //     Price price;             // 128 bits min - ERC-20 max average when buying, min average when selling; ERC-721/1155 max total price when buying, min total price when selling
            //     Execution execution;     // 8 bits - Only for ERC-20 - FILL or FILLORKILL
            //     TokenId[] tokenIds;
            //     Tokens[] tokenss;
            // }
            trades.push({ index: e.offerIndex, price: e.price, execution: 1, tokenIds: [], tokenss: [tokens.toString()] });
          }
          totalTokens = totalTokens.add(tokens);
          totalWeth = totalWeth.add(wethAmount);
          tokensRemaining = tokensRemaining.sub(tokens);
          console.log(
            padLeft(e.offerIndex, 5) +
            padLeft(e.priceIndex, 4) +
            padLeft(ethers.utils.formatEther(e.price), 16) +
            padLeft(ethers.utils.formatEther(offer), 16) +
            padLeft(ethers.utils.formatEther(tokens), 24) +
            padLeft(ethers.utils.formatEther(totalTokens), 24) +
            padLeft(ethers.utils.formatEther(wethAmount), 24) +
            padLeft(ethers.utils.formatEther(totalWeth), 24) +
            padLeft(maxWeth != null ? ethers.utils.formatEther(maxWeth) : (maxTokens != null ? ethers.utils.formatEther(maxTokens) : ''), 26)
          );
          prices[i].tokens = tokens.toString();
          prices[i].wethAmount = wethAmount.toString();
          prices[i].totalTokens = totalTokens.toString();
          prices[i].totalWeth = totalWeth.toString();
          prices[i].tokensRemaining = tokensRemaining.toString();
        }
        // console.log(now() + " INFO Addresses:methods.sellOffer prices: " + JSON.stringify(prices));
        if (maxTokens != null || maxWeth != null) {
          filledTokens = totalTokens;
          filledWeth = totalWeth;
          filledAveragePrice = totalTokens > 0 ? totalWeth.mul(TENPOW18).div(totalTokens) : 0;
        }
      }
      return {
        maxTokens: maxTokens != null && maxTokens.toString() || null,
        maxWeth: maxWeth != null && maxWeth.toString() || null,
        filledTokens: filledTokens != null && filledTokens.toString() || null,
        filledWeth: filledWeth != null && filledWeth.toString() || null,
        filledAveragePrice: filledAveragePrice != null && filledAveragePrice.toString() || null,
        maker,
        makerTokenBalance: makerTokenBalance.toString(),
        tokenAgent,
        tokenAgentTokenApproval: tokenAgentTokenApproval.toString(),
        nonce,
        trades,
        prices,
      };
    },

    buyOffer() {
      const result = {};
      console.log(now() + " INFO TradeFungibles:computed.buyOffer");
      return result;
    },

  },
  methods: {
    async trade() {
      console.log(now() + " INFO TradeFungibles:methods.trade - trades: " + JSON.stringify(this.sellOffer.trades));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = this.chainId && NETWORKS[this.chainId.toString()] || {};
      if (network.tokenAgentFactory) {
        const contract = new ethers.Contract(this.sellOffer.tokenAgent, network.tokenAgent.abi, provider);
        const contractWithSigner = contract.connect(provider.getSigner());

        console.log("tokenAgent: " + this.sellOffer.tokenAgent);
        console.log("token: " + this.data.token);
        console.log("WETH: " + this.data.weth);
        console.log("maker: " + this.modalSellOffer.maker);
        console.log("taker: " + this.coinbase);

        const token = new ethers.Contract(this.data.token, ERC20ABI, provider);
        const weth = new ethers.Contract(this.data.weth, ERC20ABI, provider);

        const makerTokenBalance = await token.balanceOf(this.modalSellOffer.maker);
        console.log("makerTokenBalance: " + ethers.utils.formatEther(makerTokenBalance));
        const makerTokenApproved = await token.allowance(this.modalSellOffer.maker, this.sellOffer.tokenAgent);
        console.log("makerTokenApproved: " + ethers.utils.formatEther(makerTokenApproved));

        const makerWethBalance = await weth.balanceOf(this.modalSellOffer.maker);
        console.log("makerWethBalance: " + ethers.utils.formatEther(makerWethBalance));
        const makerWethApproved = await weth.allowance(this.modalSellOffer.maker, this.sellOffer.tokenAgent);
        console.log("makerWethApproved: " + ethers.utils.formatEther(makerWethApproved));

        const takerTokenBalance = await token.balanceOf(this.coinbase);
        console.log("takerTokenBalance: " + ethers.utils.formatEther(takerTokenBalance));
        const takerTokenApproved = await token.allowance(this.coinbase, this.sellOffer.tokenAgent);
        console.log("takerTokenApproved: " + ethers.utils.formatEther(takerTokenApproved));

        const takerWethBalance = await weth.balanceOf(this.coinbase);
        console.log("takerWethBalance: " + ethers.utils.formatEther(takerWethBalance));
        const takerWethApproved = await weth.allowance(this.coinbase, this.sellOffer.tokenAgent);
        console.log("takerWethApproved: " + ethers.utils.formatEther(takerWethApproved));

        // const maker = this.modalSellOffer.maker;
        // const makerTokenBalance = maker && this.tokenBalances[maker] && this.tokenBalances[maker].tokens && ethers.BigNumber.from(this.tokenBalances[maker].tokens) || 0;
        // // const makerTokenBalance = ethers.BigNumber.from("5100000000000000000");
        // const tokenAgent = maker && this.modalSellOffer.tokenAgent || null;
        // const tokenAgentTokenApproval = maker && this.tokenApprovals[maker] && this.tokenApprovals[maker][tokenAgent] && ethers.BigNumber.from(this.tokenApprovals[maker][tokenAgent].tokens) || 0;


        try {
          const tx = await contractWithSigner.trade(this.sellOffer.trades, this.modalSellOffer.paymentsInEth ? 1 : 0, { value: this.modalSellOffer.paymentsInEth ? this.sellOffer.filledWeth : 0 });
          // const tx = { hash: "blah" };
          console.log(now() + " INFO TradeFungibles:methods.trade - tx: " + JSON.stringify(tx));
          const h = this.$createElement;
          const vNodesMsg = h(
            'p',
            { class: ['text-left', 'mb-0'] },
            [
              h('a', { attrs: { href: this.explorer + 'tx/' + tx.hash, target: '_blank' } }, tx.hash.substring(0, 20) + '...' + tx.hash.slice(-18)),
              h('br'),
              h('br'),
              'Resync after this tx has been included',
            ]
          );
          this.$bvToast.toast([vNodesMsg], {
            title: 'Transaction submitted',
            autoHideDelay: 5000,
          });
          // this.$refs['modalnewtokenagent'].hide();
          // this.settings.newTokenAgent.show = false;
          // this.saveSettings();
        } catch (e) {
          console.log(now() + " ERROR TradeFungibles:methods.trade: " + JSON.stringify(e));
          this.$bvToast.toast(`${e.message}`, {
            title: 'Error!',
            autoHideDelay: 5000,
          });
        }
      }
    },
    async loadData() {
      console.log(now() + " INFO TradeFungibles:methods.loadData - tokenAgentAgentSettings: " + JSON.stringify(this.settings));
      // TODO: Later move into data?
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const block = await provider.getBlock();
      const blockNumber = block && block.number || "latest";
      const network = NETWORKS['' + this.chainId] || {};

      if (network.tokenAgentFactory) {
        const tokenAgentFactoryEventsfilter = {
          address: network.tokenAgentFactory.address, fromBlock: 0, toBlock: blockNumber,
          topics: [ [], null, null ],
        };
        const tokenAgentFactoryEventLogs = await provider.getLogs(tokenAgentFactoryEventsfilter);
        this.tokenAgentFactoryEvents = parseTokenAgentFactoryEventLogs(tokenAgentFactoryEventLogs, this.chainId, network.tokenAgentFactory.address, network.tokenAgentFactory.abi, blockNumber);
        localStorage.tokenAgentTradeFungiblesTokenAgentFactoryEvents = JSON.stringify(this.tokenAgentFactoryEvents);
        const tokenAgents = {};
        for (const record of this.tokenAgentFactoryEvents) {
          tokenAgents[record.tokenAgent] = { index: record.index, indexByOwner: record.indexByOwner, owner: record.owner, nonce: 0, blockNumber: record.blockNumber, timestamp: record.timestamp, offers: {} };
        }

        // Get latest nonces
        const tokenAgentOffersInvalidatedEventsfilter = {
          address: null, fromBlock: 0, toBlock: blockNumber,
          topics: [[
              // event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
              ethers.utils.id("OffersInvalidated(uint24,uint40)"),
            ],
            null,
            null,
          ]};
        const tokenAgentOffersInvalidatedEventLogs = await provider.getLogs(tokenAgentOffersInvalidatedEventsfilter);
        const tokenAgentOffersInvalidated = parseTokenAgentEventLogs(tokenAgentOffersInvalidatedEventLogs, this.chainId, this.settings.tokenAgentAddress, network.tokenAgent.abi, blockNumber);
        for (const record of tokenAgentOffersInvalidated) {
          if (record.contract in tokenAgents) {
            tokenAgents[record.contract].nonce = record.newNonce;
            tokenAgents[record.contract].blockNumber = record.blockNumber;
            tokenAgents[record.contract].timestamp = record.timestamp;
          }
        }
        console.log(now() + " INFO TradeFungibles:methods.loadData - tokenAgents after invalidations: " + JSON.stringify(tokenAgents));
        this.data.chainId = this.chainId;
        this.data.blockNumber = blockNumber;
        this.data.timestamp = block.timestamp;
        this.data.token = this.settings.tokenContractAddress;
        this.data.weth = network.weth.address;

        const tokenAgentEventsfilter = {
          address: null, fromBlock: 0, toBlock: blockNumber,
          topics: [[
              // event Offered(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
              ethers.utils.id("Offered(uint32,address,uint8,address,uint8,uint40,uint24,uint128[],uint256[],uint128[],uint40)"),

              // event Traded(Index index, Token indexed token, TokenType tokenType, Account indexed maker, Account indexed taker, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Tokens[] remainingTokenss, Price price, Unixtime timestamp);
              // Traded (uint32 index, index_topic_1 address token, uint8 tokenType, index_topic_2 address maker, index_topic_3 address taker, uint8 makerBuySell, uint256[] prices, uint256[] tokenIds, uint256[] tokenss, uint128[] remainingTokenss, uint128 price, uint40 timestamp)
              ethers.utils.id("Traded(uint32,address,uint8,address,address,uint8,uint256[],uint256[],uint256[],uint128[],uint128,uint40)"),

              // type Account is address;  // 2^160
              // type Index is uint32;     // 2^32  = 4,294,967,296
              // type Nonce is uint24;     // 2^24  = 16,777,216
              // type Price is uint128;    // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
              // type Token is address;    // 2^160
              // type TokenId is uint;     // 2^256 = 115,792, 089,237,316,195,423,570, 985,008,687,907,853,269, 984,665,640,564,039,457, 584,007,913,129,639,936
              // type TokenId16 is uint16; // 2^16 = 65,536
              // type Tokens is uint128;   // 2^128 = 340, 282,366,920,938,463,463, 374,607,431,768,211,456
              // type Unixtime is uint40;  // 2^40  = 1,099,511,627,776. For Unixtime, 1,099,511,627,776 seconds = 34865.285000507356672 years
              // enum BuySell { BUY, SELL }
              // enum Execution { FILL, FILLORKILL }
              // enum TokenIdType { TOKENID256, TOKENID16 }
              // enum PaymentType { WETH, ETH }
              // enum TokenType { UNKNOWN, ERC20, ERC721, ERC1155, INVALID }
              // event InternalTransfer(address indexed from, address indexed to, uint ethers, Unixtime timestamp);
              // event Offered(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
              // event OfferUpdated(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
              // event OffersInvalidated(Nonce newNonce, Unixtime timestamp);
              // event Traded(Index index, Token indexed token, TokenType tokenType, Account indexed maker, Account indexed taker, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Tokens[] remainingTokenss, Price price, Unixtime timestamp);
            ],
            [ '0x000000000000000000000000' + this.settings.tokenContractAddress.substring(2, 42).toLowerCase() ],
            null,
          ]};
        const tokenAgentEventLogs = await provider.getLogs(tokenAgentEventsfilter);
        const tokenAgentEvents = parseTokenAgentEventLogs(tokenAgentEventLogs, this.chainId, this.settings.tokenAgentAddress, network.tokenAgent.abi, blockNumber);
        Vue.set(this.data, 'tokenAgentEvents', tokenAgentEvents);

        for (const e of tokenAgentEvents) {
          if (e.contract in tokenAgents) {
            if (e.eventType == "Offered") {
              tokenAgents[e.contract].offers[e.index] = e;
            } else if (e.eventType == "Traded") {
              tokenAgents[e.contract].offers[e.index].tokenss = e.remainingTokenss;
            }
          }
        }
        Vue.set(this.data, 'tokenAgents', tokenAgents);
        // console.log(now() + " INFO TradeFungibles:methods.loadData - tokenAgents: " + JSON.stringify(tokenAgents, null, 2));

        // TODO: const balance = await provider.getBalance(e.maker);
        const approvalAddressMap = {};
        const balanceAddressMap = {};
        balanceAddressMap[this.coinbase] = 1;
        for (const e of tokenAgentEvents) {
          if (!(e.contract in approvalAddressMap)) {
            approvalAddressMap[e.contract] = 1;
          }
          if (!(e.maker in balanceAddressMap)) {
            balanceAddressMap[e.maker] = 1;
          }
        }
        const approvalAddresses = Object.keys(approvalAddressMap);
        Vue.set(this.data, 'approvalAddresses', approvalAddresses);
        const balanceAddresses = Object.keys(balanceAddressMap);
        Vue.set(this.data, 'balanceAddresses', balanceAddresses);
        // console.log(now() + " INFO TradeFungibles:methods.loadData - balanceAddresses: " + JSON.stringify(balanceAddresses));

        if (approvalAddresses.length > 0) {
          const tokenApprovalsfilter = {
            address: this.settings.tokenContractAddress, fromBlock: 0, toBlock: blockNumber,
            topics: [[
                // ERC-20 event Approval(address indexed owner, address indexed spender, uint tokens);
                ethers.utils.id("Approval(address,address,uint256)"),
              ],
              null,
              approvalAddresses.map(e => '0x000000000000000000000000' + e.substring(2, 42).toLowerCase()),
            ]};
          const tokenApprovalsEventLogs = await provider.getLogs(tokenApprovalsfilter);
          const tokenApprovals = parseTokenEventLogs(tokenApprovalsEventLogs, this.chainId, blockNumber);
          Vue.set(this.data, 'tokenApprovals', tokenApprovals);
        }

        if (approvalAddresses.length > 0) {
          const wethApprovalsfilter = {
            address: network.weth.address, fromBlock: 0, toBlock: blockNumber,
            topics: [[
                // ERC-20 event Approval(address indexed owner, address indexed spender, uint tokens);
                ethers.utils.id("Approval(address,address,uint256)"),
              ],
              null,
              approvalAddresses.map(e => '0x000000000000000000000000' + e.substring(2, 42).toLowerCase()),
            ]};
          const wethApprovalsEventLogs = await provider.getLogs(wethApprovalsfilter);
          const wethApprovals = parseTokenEventLogs(wethApprovalsEventLogs, this.chainId, blockNumber);
          Vue.set(this.data, 'wethApprovals', wethApprovals);
        }

        const tokenTransferToEventsfilter = {
          address: this.settings.tokenContractAddress, fromBlock: 0, toBlock: blockNumber,
          topics: [[
              // ERC-20 event Transfer(address indexed from, address indexed to, uint tokens);
              ethers.utils.id("Transfer(address,address,uint256)"),
            ],
            null,
            balanceAddresses.map(e => '0x000000000000000000000000' + e.substring(2, 42).toLowerCase()),
            null,
          ]};
        const tokenTransferToEventsEventLogs = await provider.getLogs(tokenTransferToEventsfilter);
        const tokenTransferToEvents = parseTokenEventLogs(tokenTransferToEventsEventLogs, this.chainId, blockNumber);

        const tokenTransferFromEventsfilter = {
          address: this.settings.tokenContractAddress, fromBlock: 0, toBlock: blockNumber,
          topics: [[
              // ERC-20 event Transfer(address indexed from, address indexed to, uint tokens);
              ethers.utils.id("Transfer(address,address,uint256)"),
            ],
            balanceAddresses.map(e => '0x000000000000000000000000' + e.substring(2, 42).toLowerCase()),
            null,
            null,
          ]};
        const tokenTransferFromEventsEventLogs = await provider.getLogs(tokenTransferFromEventsfilter);
        const tokenTransferFromEvents = parseTokenEventLogs(tokenTransferFromEventsEventLogs, this.chainId, blockNumber);

        const wethTransferToEventsfilter = {
          address: network.weth.address, fromBlock: 0, toBlock: blockNumber,
          topics: [[
              // ERC-20 event Transfer(address indexed from, address indexed to, uint tokens);
              ethers.utils.id("Transfer(address,address,uint256)"),
            ],
            null,
            balanceAddresses.map(e => '0x000000000000000000000000' + e.substring(2, 42).toLowerCase()),
            null,
          ]};
        const wethTransferToEventsEventLogs = await provider.getLogs(wethTransferToEventsfilter);
        const wethTransferToEvents = parseTokenEventLogs(wethTransferToEventsEventLogs, this.chainId, blockNumber);

        const wethTransferFromEventsfilter = {
          address: network.weth.address, fromBlock: 0, toBlock: blockNumber,
          topics: [[
              // ERC-20 event Transfer(address indexed from, address indexed to, uint tokens);
              ethers.utils.id("Transfer(address,address,uint256)"),
              // WETH event  Deposit(address indexed dst, uint wad);
              ethers.utils.id("Deposit(address,uint256)"),
              // WETH event  Withdrawal(address indexed src, uint wad);
              ethers.utils.id("Withdrawal(address,uint256)"),
            ],
            balanceAddresses.map(e => '0x000000000000000000000000' + e.substring(2, 42).toLowerCase()),
            null,
            null,
          ]};
        const wethTransferFromEventsEventLogs = await provider.getLogs(wethTransferFromEventsfilter);
        const wethTransferFromEvents = parseTokenEventLogs(wethTransferFromEventsEventLogs, this.chainId, blockNumber);

        const tokenTransfers = [...tokenTransferToEvents, ...tokenTransferFromEvents];
        tokenTransfers.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return a.logIndex - b.logIndex;
          } else {
            return a.blockNumber - b.blockNumber;
          }
        });
        Vue.set(this.data, 'tokenTransfers', tokenTransfers);

        const wethTransfers = [...wethTransferToEvents, ...wethTransferFromEvents];
        wethTransfers.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return a.logIndex - b.logIndex;
          } else {
            return a.blockNumber - b.blockNumber;
          }
        });
        Vue.set(this.data, 'wethTransfers', wethTransfers);
        // console.log(now() + " INFO TradeFungibles:methods.loadData - this.data: " + JSON.stringify(this.data));
      }
      localStorage.tokenAgentTradeFungiblesData = JSON.stringify(this.data);

      this.computeState();
    },

    computeState() {
      console.log(now() + " INFO TradeFungibles:methods.computeState");

      const collator = {};
      const allEvents = [...this.data.tokenAgentEvents, ...this.data.tokenTransfers, ...this.data.tokenApprovals, ...this.data.wethTransfers, ...this.data.wethApprovals];
      // console.log("allEvents: " + JSON.stringify(allEvents, null, 2));
      for (const e of allEvents) {
        // console.log("e: " + JSON.stringify(e));
        if (!(e.txHash in collator)) {
          collator[e.txHash] = {
            blockNumber: e.blockNumber,
            txIndex: e.txIndex,
            tokenAgent: null,
            events: {},
          }
        }
        collator[e.txHash].events[e.logIndex] = e;
        if (e.eventType == "Traded") {
          // console.log("Traded: " + JSON.stringify(e));
          collator[e.txHash].tokenAgent = e.contract;
        }
      }
      const list = [];
      for (const [txHash, d] of Object.entries(collator)) {
        list.push({ blockNumber: d.blockNumber, txIndex: d.txIndex, txHash, tokenAgent: d.tokenAgent, events: d.events });
      }
      list.sort((a, b) => {
        if (a.blockNumber == b.blockNumber) {
          return a.txIndex - b.txIndex;
        } else {
          return a.blockNumber - b.blockNumber;
        }
      });

      const balanceAddressMap = {};
      for (const a of this.data.balanceAddresses) {
        balanceAddressMap[a] = 1;
      }

      const balances = {};
      const approvals = {};

      for (const l of list) {
        const logIndexes = Object.keys(l.events);
        logIndexes.sort((a, b) => {
          return a - b;
        });
        for (const logIndex of logIndexes) {
          const e = l.events[logIndex];
          if (e.eventType == "Transfer" || e.eventType == "Deposit" || e.eventType == "Withdrawal") {
            if (e.to in balanceAddressMap) {
              if (!(e.contract in balances)) {
                balances[e.contract] = {};
              }
              if (!(e.to in balances[e.contract])) {
                balances[e.contract][e.to] = { tokens: e.tokens };
              } else {
                balances[e.contract][e.to].tokens = ethers.BigNumber.from(balances[e.contract][e.to].tokens).add(e.tokens).toString();
              }
            }
            if (e.from in balanceAddressMap) {
              if (!(e.contract in balances)) {
                balances[e.contract] = {};
              }
              if (!(e.from in balances[e.contract])) {
                balances[e.contract][e.from] = {
                  tokens: e.from == ADDRESS0 ? "0" : ethers.BigNumber.from(0).sub(e.tokens).toString(),
                };
              } else {
                balances[e.contract][e.from].tokens = ethers.BigNumber.from(balances[e.contract][e.from].tokens).sub(e.tokens).toString();
              }
              // TODO: Handle reduction in approvals when trades occur
              if (l.tokenAgent != null) {
                console.log(logIndex + ". Transfer - l.tokenAgent: " + l.tokenAgent + ", from: " + e.from + ", to: " + e.to + ", tokens: " + ethers.utils.formatEther(e.tokens));
                console.log(logIndex + "  e: " + JSON.stringify(e));
                // console.log(logIndex + "  collator[txHash]: " + JSON.stringify(collator[e.txHash]));
                // if (!(e.contract in approvals)) {
                //   approvals[e.contract] = {};
                // }
                // if (!(e.from in approvals[e.contract])) {
                //   approvals[e.contract][e.from] = {};
                // }
                approvals[e.contract][e.from][l.tokenAgent].spent = ethers.BigNumber.from(approvals[e.contract][e.from][l.tokenAgent].spent).add(e.tokens).toString();
                approvals[e.contract][e.from][l.tokenAgent].spends.push({ txHash: e.txHash, logIndex: e.logIndex, tokens: e.tokens });
                // approvals[e.contract][e.owner][e.spender] = { tokens: e.tokens, txHash: e.txHash, logIndex: e.logIndex };
              }
            }

          } else if (e.eventType == "Approval") {
            // console.log(logIndex + ". Approval - trade: " + trade + " " + JSON.stringify(e));
            if (!(e.contract in approvals)) {
              approvals[e.contract] = {};
            }
            if (!(e.owner in approvals[e.contract])) {
              approvals[e.contract][e.owner] = {};
            }
            approvals[e.contract][e.owner][e.spender] = { tokens: e.tokens, txHash: e.txHash, logIndex: e.logIndex, spent: 0, spends: [] };

          } else if (e.eventType == "Offered") {
            // console.log(logIndex + ". Offered - trade: " + trade + " " + JSON.stringify(e));

          } else if (e.eventType == "Traded") {
            // console.log(logIndex + ". Traded - trade: " + trade + " " + JSON.stringify(e));

          } else {
            // console.log(logIndex + ". ELSE - trade: " + trade + " " + JSON.stringify(e));
          }
        }
      }
      // console.log("balances: " + JSON.stringify(balances, null, 2));
      console.log("approvals: " + JSON.stringify(approvals, null, 2));

      const tokenBalances = {};
      for (const transfer of this.data.tokenTransfers) {
        if (transfer.to in balanceAddressMap) {
          if (!(transfer.to in tokenBalances)) {
            tokenBalances[transfer.to] = { tokens: transfer.tokens };
          } else {
            tokenBalances[transfer.to].tokens = ethers.BigNumber.from(tokenBalances[transfer.to].tokens).add(transfer.tokens).toString();
          }
        }
        if (transfer.from in balanceAddressMap) {
          if (!(transfer.from in tokenBalances)) {
            tokenBalances[transfer.from] = {
              tokens: transfer.from == ADDRESS0 ? "0" : ethers.BigNumber.from(0).sub(transfer.tokens).toString(),
            };
          } else {
            tokenBalances[transfer.from].tokens = ethers.BigNumber.from(tokenBalances[transfer.from].tokens).sub(transfer.tokens).toString();
          }
        }
      }
      Vue.set(this, 'tokenBalances', tokenBalances);
      console.log(now() + " INFO TradeFungibles:methods.computeState - tokenBalances: " + JSON.stringify(tokenBalances));

      const wethBalances = {};
      for (const e of this.data.wethTransfers) {
        if (e.to in balanceAddressMap) {
          if (!(e.to in wethBalances)) {
            wethBalances[e.to] = { tokens: e.tokens };
          } else {
            wethBalances[e.to].tokens = ethers.BigNumber.from(wethBalances[e.to].tokens).add(e.tokens).toString();
          }
        }
        if (e.from in balanceAddressMap) {
          if (!(e.from in wethBalances)) {
            wethBalances[e.from] = {
              tokens: e.from == ADDRESS0 ? "0" : ethers.BigNumber.from(0).sub(e.tokens).toString(),
            };
          } else {
            wethBalances[e.from].tokens = ethers.BigNumber.from(wethBalances[e.from].tokens).sub(e.tokens).toString();
          }
        }
      }
      Vue.set(this, 'wethBalances', wethBalances);
      console.log(now() + " INFO TradeFungibles:methods.computeState - wethBalances: " + JSON.stringify(wethBalances));

      const tokenApprovals = {};
      for (const e of this.data.tokenApprovals) {
        if (!(e.owner in tokenApprovals)) {
          tokenApprovals[e.owner] = {};
        }
        tokenApprovals[e.owner][e.spender] = { tokens: e.tokens, txHash: e.txHash, logIndex: e.logIndex };
      }
      Vue.set(this, 'tokenApprovals', tokenApprovals);
      console.log(now() + " INFO TradeFungibles:methods.computeState - tokenApprovals: " + JSON.stringify(tokenApprovals));
      const wethApprovals = {};
      for (const e of this.data.wethApprovals) {
        if (!(e.owner in wethApprovals)) {
          wethApprovals[e.owner] = {};
        }
        wethApprovals[e.owner][e.spender] = { tokens: e.tokens, txHash: e.txHash, logIndex: e.logIndex };
      }
      Vue.set(this, 'wethApprovals', wethApprovals);
      console.log(now() + " INFO TradeFungibles:methods.computeState - wethApprovals: " + JSON.stringify(wethApprovals));
    },

    sellOffersRowSelected(item) {
      console.log(now() + " INFO Addresses:methods.sellOffersRowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        this.modalSellOffer.txHash = item[0].txHash;
        this.modalSellOffer.logIndex = item[0].logIndex;
        this.modalSellOffer.maker = item[0].maker;
        this.modalSellOffer.tokenAgent = item[0].tokenAgent;
        this.modalSellOffer.tokenAgentIndexByOwner = item[0].tokenAgentIndexByOwner;
        this.modalSellOffer.offerIndex = item[0].offerIndex;
        this.modalSellOffer.priceIndex = item[0].priceIndex;
        this.modalSellOffer.price = item[0].price;
        this.modalSellOffer.tokens = item[0].token;
        this.modalSellOffer.expiry = item[0].expiry;
        this.modalSellOffer.offer = this.data.tokenAgents[item[0].tokenAgent].offers[item[0].offerIndex];
        // this.modalSellOffer = {
        //   txHash: item[0].txHash,
        //   logIndex: item[0].logIndex,
        //   maker: item[0].maker,
        //   tokenAgent: item[0].tokenAgent,
        //   tokenAgentIndexByOwner: item[0].tokenAgentIndexByOwner,
        //   offerIndex: item[0].offerIndex,
        //   priceIndex: item[0].priceIndex,
        //   price: item[0].price,
        //   tokens: item[0].token,
        //   expiry: item[0].expiry,
        //   offer: this.data.tokenAgents[item[0].tokenAgent].offers[item[0].offerIndex],
        // };
        this.$refs.modalselloffer.show();
        this.$refs.sellOffersTable.clearSelected();
      }
    },

    buyOffersRowSelected(item) {
      console.log(now() + " INFO Addresses:methods.buyOffersRowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        // const tokenAgent = this.data.tokenAgents[item[0].tokenAgent];
        // console.log(now() + " INFO Addresses:methods.buyOffersRowSelected tokenAgent: " + JSON.stringify(tokenAgent, null, 2));
        // const offer = tokenAgent.offers[item[0].offerIndex];
        // console.log(now() + " INFO Addresses:methods.buyOffersRowSelected offer: " + JSON.stringify(offer, null, 2));
        this.modalBuyOffer = {
          txHash: item[0].txHash,
          logIndex: item[0].logIndex,
          maker: item[0].maker,
          tokenAgent: item[0].tokenAgent,
          tokenAgentIndexByOwner: item[0].tokenAgentIndexByOwner,
          offerIndex: item[0].offerIndex,
          priceIndex: item[0].priceIndex,
          price: item[0].price,
          tokens: item[0].token,
          expiry: item[0].expiry,
          offer: this.data.tokenAgents[item[0].tokenAgent].offers[item[0].offerIndex],
        };
        this.$refs.modalbuyoffer.show();
        this.$refs.buyOffersTable.clearSelected();
      }
    },

    async addOffer() {
      console.log(now() + " INFO TradeFungibles:methods.addOffer - settings.addOffers: " + JSON.stringify(this.settings.addOffers, null, 2));
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = NETWORKS['' + this.chainId] || {};
      const contract = new ethers.Contract(this.settings.tokenAgentAddress, network.tokenAgent.abi, provider);
      const contractWithSigner = contract.connect(provider.getSigner());
      if (network.tokenAgentFactory) {
        if (this.settings.addOffers.type == 20) {
          let prices = [];
          let tokens = [];
          if (this.settings.addOffers.pricing == 0) {
            console.log(now() + " INFO TradeFungibles:methods.addOffer - ERC-20 Single price without limit - price: " + this.settings.addOffers.price);
            prices = [ethers.utils.parseUnits(this.settings.addOffers.price, 18).toString()];
          } else if (this.settings.addOffers.pricing == 1) {
            console.log(now() + " INFO TradeFungibles:methods.addOffer - ERC-20 Single price with limit - price: " + this.settings.addOffers.price + ", tokens: " + this.settings.addOffers.tokens);
            prices = [ethers.utils.parseUnits(this.settings.addOffers.price, 18).toString()];
            tokens = [ethers.utils.parseUnits(this.settings.addOffers.tokens, this.settings.addOffers.decimals).toString()];
          } else {
            console.log(now() + " INFO TradeFungibles:methods.addOffer - ERC-20 Multiple prices with limits - UNSUPPORTED");
          }
          if (prices.length > 0) {
            const payload = [
              [
                this.settings.addOffers.token,
                parseInt(this.settings.addOffers.buySell),
                "2041432206", // Sat Sep 09 2034 16:30:06 GMT+0000
                0,
                prices,
                [],
                tokens,
              ],
            ];
            try {
              console.log(now() + " INFO TradeFungibles:methods.addOffer - payload: " + JSON.stringify(payload));
              const tx = await contractWithSigner.addOffers(payload, { gasLimit: 500000 });
              console.log(now() + " INFO TradeFungibles:methods.addOffer - tx: " + JSON.stringify(tx));
              const h = this.$createElement;
              const vNodesMsg = h(
                'p',
                { class: ['text-left', 'mb-0'] },
                [
                  h('a', { attrs: { href: this.explorer + 'tx/' + tx.hash, target: '_blank' } }, tx.hash.substring(0, 20) + '...' + tx.hash.slice(-18)),
                  h('br'),
                  h('br'),
                  'Resync after this tx has been included',
                ]
              );
              this.$bvToast.toast([vNodesMsg], {
                title: 'Transaction submitted',
                autoHideDelay: 5000,
              });
            } catch (e) {
              console.log(now() + " ERROR TradeFungibles:methods.addOffer: " + JSON.stringify(e));
              this.$bvToast.toast(`${e.message}`, {
                title: 'Error!',
                autoHideDelay: 5000,
              });
            }
          }
        } else {
          console.log(now() + " INFO TradeFungibles:methods.addOffer - ERC-721/1155 - UNSUPPORTED");
        }
      }
    },

    formatTimestamp(ts) {
      if (ts != null) {
        // if (this.settings.reportingDateTime == 1) {
        //   return moment.unix(ts).utc().format("YYYY-MM-DD HH:mm:ss");
        // } else {
          return moment.unix(ts).format("YYYY-MM-DD HH:mm:ss");
        // }
      }
      return null;
    },
    formatDecimals(e, decimals = 18) {
      return e ? ethers.utils.formatUnits(e, decimals).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : null;
    },
    validNumber(n, d) {
      if (n && d != null) {
        // console.log(now() + " DEBUG TradeFungibles:methods.validNumber - n: " + n + ", d: " + d);
        try {
          const n_ = ethers.utils.parseUnits(n, d);
          // console.log(now() + " DEBUG TradeFungibles:methods.validNumber - n_: " + n_.toString());
          return true;
        } catch (e) {
        }
      }
      return false;
    },

    validAddress(a) {
      if (a) {
        try {
          const address = ethers.utils.getAddress(a);
          return true;
        } catch (e) {
        }
      }
      return false;
    },
    saveSettings() {
      // console.log(now() + " INFO TradeFungibles:methods.saveSettings - tokenAgentAgentSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.tokenAgentTradeFungiblesSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    newTransfer(stealthMetaAddress = null) {
      console.log(now() + " INFO TradeFungibles:methods.newTransfer - stealthMetaAddress: " + stealthMetaAddress);
      store.dispatch('newTransfer/newTransfer', stealthMetaAddress);
    },
    async timeoutCallback() {
      // console.log(now() + " DEBUG TradeFungibles:methods.timeoutCallback - count: " + this.count);
      this.count++;
      var t = this;
      if (this.reschedule) {
        setTimeout(function() {
          t.timeoutCallback();
        }, 15000);
      }
    },
  },
  beforeDestroy() {
    // console.log(now() + " DEBUG TradeFungibles:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG TradeFungibles:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('tokenAgentTradeFungiblesSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.tokenAgentTradeFungiblesSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        // this.settings.currentPage = 1;
        if ('tokenAgentTradeFungiblesData' in localStorage) {
          this.data = JSON.parse(localStorage.tokenAgentTradeFungiblesData);
          this.computeState();
        }
      }
      // this.loadData(this.settings.tokenAgentAddress);
    }
    this.reschedule = true;
    // console.log(now() + " DEBUG TradeFungibles:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const tradeFungiblesModule = {
  namespaced: true,
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
};
