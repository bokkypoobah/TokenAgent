const TradeFungibles = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <b-modal ref="modalselloffer" hide-footer header-class="m-0 px-3 py-2" body-class="m-0 p-0" body-bg-variant="light" size="lg">
          <template #modal-title>Sell Offer</template>
          <div class="m-0 p-1">
            <!-- <b-form-group label="New Token Agent" label-size="sm" label-cols-sm="6" label-align-sm="right" class="mx-0 my-1 p-0">
              <b-button size="sm" @click="deployNewTokenAgent" variant="warning">Deploy</b-button>
            </b-form-group> -->
          </div>
        </b-modal>

        <b-modal ref="modalbuyoffer" hide-footer header-class="m-0 px-3 py-2" body-class="m-0 p-0" body-bg-variant="light" size="lg">
          <template #modal-title>Buy Offer</template>
          <div class="m-0 p-1">
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
                  <template #cell(price)="data">
                    <font size="-1">
                      {{ formatDecimals(data.item.price, 18) }}
                    </font>
                  </template>
                  <template #cell(tokens)="data">
                    <font size="-1">
                      {{ formatDecimals(data.item.tokens, 18) }}
                    </font>
                  </template>
                  <template #cell(maker)="data">
                    <font size="-1">
                      {{ data.item.maker.substring(0, 8) + '...' + data.item.maker.slice(-6) }}
                    </font>
                  </template>
                  <template #cell(info)="data">
                    <font size="-1">
                      {{ data.item.tokenAgent.substring(0, 6) + '...' + data.item.tokenAgent.slice(-4) + ':' + data.item.tokenAgentIndexByOwner }}
                    </font>
                  </template>
                  <template #cell(number)="data">
                    <font size="-1">
                      {{ parseInt(data.index) + ((settings.sellOffers.currentPage - 1) * settings.sellOffers.pageSize) + 1 }}
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
                      {{ formatDecimals(data.item.tokens, 18) }}
                    </font>
                  </template>
                  <template #cell(maker)="data">
                    <font size="-1">
                      {{ data.item.maker.substring(0, 8) + '...' + data.item.maker.slice(-6) }}
                    </font>
                  </template>
                  <template #cell(info)="data">
                    <font size="-1">
                      {{ data.item.tokenAgent.substring(0, 6) + '...' + data.item.tokenAgent.slice(-4) + ':' + data.item.tokenAgentIndexByOwner }}
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
          <b-row class="m-0 p-0">
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

        <div v-if="false && (settings.tabIndex == 0 || settings.tabIndex == 1 || settings.tabIndex == 2)" class="d-flex flex-wrap m-0 mt-1 p-0">
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="false && sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!networkSupported" @click="viewSyncOptions" variant="link" v-b-popover.hover.ds500="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="false && sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.ds500="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div v-if="false" class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.ds500="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="false" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(null); " variant="link" v-b-popover.hover.ds500="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <div v-if="settings.tabIndex == 0">
              <b-form-select size="sm" v-model="settings.offers.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
            </div>
            <div v-else-if="settings.tabIndex == 1">
              <b-form-select size="sm" v-model="settings.events.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
            </div>
            <div v-else>
              <b-form-select size="sm" v-model="settings.approvals.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
            </div>
          </div>
          <div class="mt-0 pr-1">
            <div v-if="settings.tabIndex == 0">
              <font size="-2" v-b-popover.hover.ds500="'# filtered / all entries'">{{ filteredSortedOffers.length + '/' + offers.length }}</font>
            </div>
            <div v-else-if="settings.tabIndex == 1">
              <font size="-2" v-b-popover.hover.ds500="'# filtered / all entries'">{{ filteredSortedEvents.length + '/' + events.length }}</font>
            </div>
            <div v-else>
              <font size="-2" v-b-popover.hover.ds500="'# filtered / all entries'">{{ filteredSortedApprovals.length + '/' + approvals.length }}</font>
            </div>
          </div>
          <div class="mt-0 pr-1">
            <div v-if="settings.tabIndex == 0">
              <b-pagination size="sm" v-model="settings.offers.currentPage" @input="saveSettings" :total-rows="filteredSortedOffers.length" :per-page="settings.offers.pageSize" style="height: 0;"></b-pagination>
            </div>
            <div v-else-if="settings.tabIndex == 1">
              <b-pagination size="sm" v-model="settings.events.currentPage" @input="saveSettings" :total-rows="filteredSortedEvents.length" :per-page="settings.events.pageSize" style="height: 0;"></b-pagination>
            </div>
            <div v-else>
              <b-pagination size="sm" v-model="settings.approvals.currentPage" @input="saveSettings" :total-rows="filteredSortedApprovals.length" :per-page="settings.approvals.pageSize" style="height: 0;"></b-pagination>
            </div>
          </div>
          <div class="mt-0 pl-1">
            <div v-if="settings.tabIndex == 0">
              <b-form-select size="sm" v-model="settings.offers.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
            </div>
            <div v-else-if="settings.tabIndex == 1">
              <b-form-select size="sm" v-model="settings.events.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
            </div>
            <div v-else>
              <b-form-select size="sm" v-model="settings.approvals.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
            </div>
          </div>
        </div>

        <!-- Offers -->
        <b-card v-if="false && settings.tabIndex == 0" class="m-0 p-0 border-0" body-class="m-0 p-0">
          <!-- <b-table ref="offersTable" small fixed striped responsive hover :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1"> -->
          <b-table ref="offersTable" small fixed striped responsive hover :fields="offersFields" :items="pagedFilteredSortedOffers" show-empty head-variant="light" class="m-0 mt-1">
            <template #cell(number)="data">
              <font size="-1">
                {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
              </font>
            </template>
            <template #cell(when)="data">
              <font size="-1">
                <b-link size="sm" :href="explorer + 'tx/' + data.item.txHash + '#eventlog#' + data.item.logIndex" variant="link" v-b-popover.hover.ds500="data.item.blockNumber + ':' + data.item.txIndex + '.' + data.item.logIndex" target="_blank">
                  {{ formatTimestamp(data.item.timestamp) }}
                </b-link>
              </font>
              <!-- <b-link size="sm" :href="explorer + 'tx/' + data.item.txHash + '#eventlog#' + data.item.logIndex" variant="link" v-b-popover.hover.ds500="(timestamps[chainId] && timestamps[chainId][data.item.blockNumber]) ? ('Block ' + formatNumber(data.item.blockNumber)) : 'blockNumber:txIndex'" target="_blank">
                <span v-if="timestamps[chainId] && timestamps[chainId][data.item.blockNumber]">
                  {{ formatTimestamp(timestamps[chainId][data.item.blockNumber]) }}
                </span>
                <span v-else>
                  {{ data.item.blockNumber + ':' + data.item.txIndex }}
                </span>
              </b-link> -->
            </template>
            <template #cell(token)="data">
              <font size="-1">
                <b-link size="sm" :href="explorer + 'token/' + data.item.token" variant="link" v-b-popover.hover.ds500="data.item.token" target="_blank">
                  {{ data.item.token.substring(0, 10) + '...' + data.item.token.slice(-8) }}
                </b-link>
              </font>
            </template>
            <template #cell(tokenType)="data">
              <font size="-1">
                <!-- <b-badge variant="light" class="m-0 p-0"> -->
                  {{ data.item.tokenType == 1 ? 'ERC-20' : (data.item.tokenType == 2 ? 'ERC-721' : 'ERC-1155') }}
                <!-- </b-badge> -->
              </font>
            </template>
            <template #cell(buySell)="data">
              <font size="-1">
                {{ data.item.buySell == 0 ? 'Buy' : 'Sell' }}
              </font>
            </template>
            <template #cell(price)="data">
              <div v-if="data.item.tokenType == 1">
                <font size="-1">
                  <div v-if="data.item.tokenss.length == 0">
                    {{ formatDecimals(data.item.prices[0], 18) }}
                  </div>
                  <div v-else>
                    <span v-for="(tokens, index) of data.item.tokenss" v-bind:key="index">
                      {{ formatDecimals(tokens, 18) }} @ {{ formatDecimals(data.item.prices[index], 18) }}
                    </span>
                  </div>
                </font>
              </div>
              <div v-else>
                <font size="-2"><pre>
{{ JSON.stringify(data.item, null, 2) }}
                </pre></font>
              </div>
            </template>
            <template #cell(expiry)="data">
              <font size="-1">
                {{ data.item.expiry == 0 ? '(no expiry)' : formatTimestamp(data.item.expiry) }}
              </font>
            </template>
            <template #cell(nonce)="data">
              <font size="-1">
                <div v-if="data.item.nonce < nonce" v-b-popover.hover.ds500="'Invalidated. Latest nonce is ' + nonce">
                  <strike>{{ data.item.nonce }}</strike>
                </div>
                <div v-else>
                  {{ data.item.nonce }}
                </div>
              </font>
            </template>
          </b-table>
        </b-card>

        <!-- Events -->
        <b-card v-if="false && settings.tabIndex == 1" class="m-0 p-0 border-0" body-class="m-0 p-0">
          <b-table ref="offersTable" small fixed striped responsive hover :fields="eventsFields" :items="pagedFilteredSortedEvents" show-empty head-variant="light" class="m-0 mt-1">
            <template #cell(number)="data">
              <font size="-1">
                {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
              </font>
            </template>
            <template #cell(when)="data">
              <font size="-1">
                <b-link size="sm" :href="explorer + 'tx/' + data.item.txHash + '#eventlog#' + data.item.logIndex" variant="link" v-b-popover.hover.ds500="data.item.blockNumber + ':' + data.item.txIndex + '.' + data.item.logIndex" target="_blank">
                  {{ formatTimestamp(data.item.timestamp) }}
                </b-link>
              </font>
            </template>
            <template #cell(eventType)="data">
              <font size="-1">
                <!-- <b-badge variant="light" class="m-0 p-0"> -->
                  {{ data.item.eventType }}
                <!-- </b-badge> -->
              </font>
            </template>
            <template #cell(taker)="data">
              <font v-if="data.item.taker" size="-1">
                <b-link size="sm" :href="explorer + 'address/' + data.item.taker" variant="link" v-b-popover.hover.ds500="data.item.taker" target="_blank">
                  {{ data.item.taker.substring(0, 10) + '...' + data.item.taker.slice(-8) }}
                </b-link>
              </font>
            </template>
            <template #cell(maker)="data">
              <font v-if="data.item.maker" size="-1">
                <b-link size="sm" :href="explorer + 'address/' + data.item.maker" variant="link" v-b-popover.hover.ds500="data.item.maker" target="_blank">
                  {{ data.item.maker.substring(0, 10) + '...' + data.item.maker.slice(-8) }}
                </b-link>
              </font>
            </template>
            <template #cell(token)="data">
              <font v-if="data.item.token" size="-1">
                <b-link size="sm" :href="explorer + 'token/' + data.item.token" variant="link" v-b-popover.hover.ds500="data.item.token" target="_blank">
                  {{ data.item.token.substring(0, 10) + '...' + data.item.token.slice(-8) }}
                </b-link>
              </font>
            </template>
            <template #cell(info)="data">
              <div v-if="data.item.eventType == 'Offered'">
                <font size="-1">
                  index: {{ data.item.index }},
                  type: {{ data.item.tokenType == 1 ? 'ERC-20' : (data.item.tokenType == 2 ? 'ERC-721' : 'ERC-1155') }},
                  buySell: {{ data.item.buySell == 0 ? 'Buy' : 'Sell' }},
                  expiry: {{ data.item.expiry == 0 ? '(no expiry)' : formatTimestamp(data.item.expiry) }},
                  count: {{ data.item.count }},
                  nonce: {{ data.item.nonce }},
                  prices: [{{ data.item.prices.map(e => formatDecimals(e, 18)).join(', ') }}]
                  tokenIds: [{{ data.item.tokenIds.map(e => parseInt(e)).join(', ') }}]
                  tokenss: [{{ data.item.tokenss.map(e => formatDecimals(e, 18)).join(', ') }}]
                </font>
              </div>
              <div v-else-if="data.item.eventType == 'OffersInvalidated'">
                <font size="-1">
                  newNonce: {{ data.item.newNonce }}
                </font>
                <!-- <font size="-2"><pre>
{{ JSON.stringify(data.item, null, 2) }}
                </pre></font> -->
              </div>
            </template>
          </b-table>
        </b-card>

        <!-- Approvals -->
        <b-card v-if="false && settings.tabIndex == 2" class="m-0 p-0 border-0" body-class="m-0 p-0">
          <b-table ref="approvalsTable" small fixed striped responsive hover :fields="approvalsFields" :items="pagedFilteredSortedApprovals" show-empty head-variant="light" class="m-0 mt-1">
            <template #cell(number)="data">
              <font size="-1">
                {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
              </font>
            </template>
            <template #cell(when)="data">
              <font size="-1">
                <b-link size="sm" :href="explorer + 'tx/' + data.item.txHash + '#eventlog#' + data.item.logIndex" variant="link" v-b-popover.hover.ds500="data.item.txHash" target="_blank">
                  <!-- {{ formatTimestamp(data.item.timestamp) }} -->
                  {{ data.item.blockNumber + ':' + data.item.txIndex + '.' + data.item.logIndex }}
                </b-link>
              </font>
            </template>
            <template #cell(token)="data">
              <font size="-1">
                <b-link size="sm" :href="explorer + 'token/' + data.item.token" variant="link" v-b-popover.hover.ds500="data.item.token" target="_blank">
                  {{ data.item.token.substring(0, 10) + '...' + data.item.token.slice(-8) }}
                </b-link>
              </font>
            </template>
            <template #cell(eventType)="data">
              <font size="-1">
                {{ data.item.eventType }}
              </font>
            </template>
            <template #cell(owner)="data">
              <font size="-1">
                <b-link size="sm" :href="explorer + 'address/' + data.item.owner" variant="link" v-b-popover.hover.ds500="data.item.owner" target="_blank">
                  {{ data.item.owner.substring(0, 10) + '...' + data.item.owner.slice(-8) }}
                </b-link>
              </font>
            </template>
            <template #cell(spenderOperator)="data">
              <font size="-1">
                <div v-if="data.item.spender">
                  <b-link size="sm" :href="explorer + 'address/' + data.item.spender" variant="link" v-b-popover.hover.ds500="data.item.spender" target="_blank">
                    {{ (data.item.spender.substring(0, 10) + '...' + data.item.spender.slice(-8)) }}
                  </b-link>
                </div>
                <div v-else-if="data.item.operator">
                  <b-link size="sm" :href="explorer + 'address/' + data.item.operator" variant="link" v-b-popover.hover.ds500="data.item.operator" target="_blank">
                    {{ (data.item.operator.substring(0, 10) + '...' + data.item.operator.slice(-8)) }}
                  </b-link>
                </div>
              </font>
            </template>
            <template #cell(tokensApproved)="data">
              <font size="-1">
                <div v-if="data.item.tokens">
                  {{ formatDecimals(data.item.tokens, 18) }}
                </div>
                <div v-else-if="data.item.approved">
                  {{ data.item.approved }}
                </div>
              </font>
              <!-- <font size="-2"><pre>
{{ JSON.stringify(data.item, null, 2) }}
              </pre></font> -->
            </template>
          </b-table>
        </b-card>

        <b-card v-if="false && settings.tabIndex == 3" class="m-0 p-0 border-0" body-class="m-0 p-2">
          <b-card bg-variant="light">
            <b-form-group label-cols-lg="2" label="Add Offers" label-size="lg" label-class="font-weight-bold pt-0" class="mb-0">

              <b-form-group label="Token:" label-for="addoffers-token" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!settings.addOffers.token || validAddress(settings.addOffers.token)" :invalid-feedback="'Invalid address'" :description="settings.addOffers.token && validAddress(settings.addOffers.token) && settings.addOffers.type && ('ERC-' + settings.addOffers.type + ' ' + settings.addOffers.symbol) || 'Enter address'" class="mx-0 my-1 p-0">
                <b-input-group style="width: 28.0rem;">
                  <b-form-input size="sm" id="addoffers-token" v-model.trim="settings.addOffers.token" @change="saveSettings" placeholder="Token address, or select from dropdown"></b-form-input>
                  <b-input-group-append>
                    <b-dropdown size="sm" id="dropdown-left" text="" variant="link" v-b-popover.hover.ds500="'Token contracts'" class="m-0 ml-1 p-0">
                      <b-dropdown-item v-if="tokenContractsDropdownOptions.length == 0" disabled>No Token contracts with transfers permitted</b-dropdown-item>
                      <div v-for="(item, index) of tokenContractsDropdownOptions" v-bind:key="index">
                        <b-dropdown-item @click="settings.addOffers.token = item.tokenContract; settings.addOffers.type = item.type; settings.addOffers.symbol = item.symbol; settings.addOffers.decimals = item.decimals; saveSettings();">{{ index }}. {{ item.tokenContract.substring(0, 8) + '...' + item.tokenContract.slice(-6) + ' ' + item.symbol + ' ' + item.name + ' ' + (item.decimals != null ? parseInt(item.decimals) : '') }}</b-dropdown-item>
                      </div>
                    </b-dropdown>
                    <b-button size="sm" :disabled="!validAddress(settings.addOffers.token)" :href="explorer + 'token/' + settings.addOffers.token" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 mt-1 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
                    <!-- <font size="-1">
                      <b-badge v-if="settings.addOffers.type" variant="light" class="mt-2" v-b-popover.hover.ds500="'ERC-20/721/1155'">{{ 'ERC-' + settings.addOffers.type }}</b-badge>
                    </font> -->
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <b-form-group label="Buy/Sell:" label-for="addoffers-buysell" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="addoffers-buysell" v-model="settings.addOffers.buySell" @change="saveSettings" :options="buySellOptions" v-b-popover.hover.ds500="'Owner BUY or SELL'" class="w-25"></b-form-select>
              </b-form-group>
              <b-form-group v-if="settings.addOffers.type == 721 || settings.addOffers.type == 1155" label="Count:" label-for="addoffers-count" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input size="sm" type="number" id="addoffers-count" v-model.trim="settings.addOffers.count" @change="saveSettings" class="w-25"></b-form-input>
              </b-form-group>

              <b-form-group v-if="settings.addOffers.type == 20" label="Pricing:" label-for="addoffers-pricing" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="addoffers-pricing" v-model="settings.addOffers.pricing" @change="saveSettings" :options="pricing20Options" v-b-popover.hover.ds500="'Single or multiple prices and/or limits'" class="w-25"></b-form-select>
              </b-form-group>

              <b-form-group v-if="settings.addOffers.type == 20 && settings.addOffers.pricing < 2" label="Price:" label-for="addoffers-price" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!settings.addOffers.price || validNumber(settings.addOffers.price, 18)" :invalid-feedback="'Invalid price'" :description="'Enter price in [W]ETH to 18 decimal places'" class="mx-0 my-1 p-0">
                <b-form-input size="sm" type="number" id="addoffers-price" v-model.trim="settings.addOffers.price" @change="saveSettings" class="w-25"></b-form-input>
              </b-form-group>

              <b-form-group v-if="settings.addOffers.type == 20 && settings.addOffers.pricing == 1" label="Tokens:" label-for="addoffers-tokens" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!settings.addOffers.tokens || validNumber(settings.addOffers.tokens, settings.addOffers.decimals)" :invalid-feedback="'Invalid tokens'" :description="'Enter number of tokens to ' + settings.addOffers.decimals + ' decimal places'" class="mx-0 my-1 p-0">
                <b-form-input size="sm" type="number" id="addoffers-tokens" v-model.trim="settings.addOffers.tokens" @change="saveSettings" class="w-25"></b-form-input>
              </b-form-group>

              <b-form-group label="" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!addOffersFeedback" :invalid-feedback="addOffersFeedback" class="mx-0 my-1 p-0">
                <b-button size="sm" :disabled="!networkSupported || !!addOffersFeedback" @click="addOffer" variant="warning">Add Offer</b-button>
              </b-form-group>
            </b-form-group>
            <!--
            // ERC-20
            //   prices[price0], tokenIds[], tokenss[]
            //   prices[price0], tokenIds[], tokenss[tokens0, tokens1, ...]
            //   prices[price0, price1, ...], tokenIds[], tokenss[tokens0, tokens1, ...]
            // ERC-721
            //   prices[price0], tokenIds[], tokenss[]
            //   prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[]
            //   prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[]
            // ERC-1155
            //   prices[price0], tokenIds[], tokenss[]
            //   prices[price0], tokenIds[tokenId0, tokenId1, ...], tokenss[]
            //   prices[price0, price1, ...], tokenIds[tokenId0, tokenId1, ...], tokenss[tokens0, tokens1, ...]
             -->
          </b-card>
        </b-card>

        <b-table v-if="false" ref="theTable" small fixed striped responsive hover :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
          <template #empty="scope">
            <h6>{{ scope.emptyText }}</h6>
            <div>
              <ul>
                <li>
                  Check you are connected to the Sepolia testnet, currently
                </li>
                <li>
                  Click <b-button size="sm" variant="link" class="m-0 p-0"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button> above to sync this app to the blockchain
                </li>
              </ul>
            </div>
          </template>
          <template #cell(number)="data">
            {{ parseInt(data.index) + ((settings.currentPage - 1) * settings.pageSize) + 1 }}
          </template>
          <template #cell(tokenAgent)="data">
            <b-link :href="explorer + 'address/' + data.item.tokenAgent + '#code'" v-b-popover.hover.ds500="data.item.tokenAgent" target="_blank">
              {{ names[data.item.tokenAgent] || data.item.tokenAgent }}
            </b-link>
          </template>
          <template #cell(owner)="data">
            <b-link :href="explorer + 'address/' + data.item.owner" v-b-popover.hover.ds500="data.item.owner" target="_blank">
              {{ names[data.item.owner] || data.item.owner }}
            </b-link>
          </template>
          <!-- <template #cell(transfer)="data">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(data.item.stealthMetaAddress);" variant="link" v-b-popover.hover.ds500="'Transfer to ' + data.item.stealthMetaAddress" class="m-0 ml-2 p-0"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </template> -->
        </b-table>
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
        offers: {
          filter: null,
          currentPage: 1,
          pageSize: 10,
          sortOption: 'txorderdsc',
        },
        events: {
          filter: null,
          currentPage: 1,
          pageSize: 10,
          sortOption: 'txorderdsc',
        },
        approvals: {
          filter: null,
          currentPage: 1,
          pageSize: 10,
          sortOption: 'txorderdsc',
        },

        // TODO: Delete below
        filter: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'ownertokenagentasc',

        version: 1,
      },

      tokenAgentFactoryEvents: [],

      data: {
        chainId: null,
        blockNumber: null,
        timestamp: null,
        token: null,
        weth: null,
        tokenAgents: {},
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
      sellOffersFields: [
        // { key: 'nonce', label: 'Nonce', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 20%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'maker', label: 'Maker', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        { key: 'price', label: 'Price', sortable: false, thStyle: 'width: 25%;', thClass: 'text-right', tdClass: 'text-right' },
        // { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'tokenType', label: 'Type', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'buySell', label: 'B/S', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
      ],
      buyOffersFields: [
        { key: 'price', label: 'Price', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
        { key: 'tokens', label: 'Tokens', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
        { key: 'maker', label: 'Maker', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 20%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        // { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'tokenType', label: 'Type', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'buySell', label: 'B/S', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        // { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        // { key: 'nonce', label: 'Nonce', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
      offersFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'when', label: 'When', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        { key: 'tokenType', label: 'Type', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        { key: 'buySell', label: 'B/S', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-left' },
        { key: 'price', label: 'Price', sortable: false, thStyle: 'width: 35%;', tdClass: 'text-left' },
        { key: 'expiry', label: 'Expiry', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        { key: 'nonce', label: 'Nonce', sortable: false, thStyle: 'width: 5%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
      eventsFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'when', label: 'When', sortable: false, thStyle: 'width: 12%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'maker', label: 'Maker', sortable: false, thStyle: 'width: 12%;', tdClass: 'text-left' },
        { key: 'taker', label: 'Taker', sortable: false, thStyle: 'width: 12%;', tdClass: 'text-left' },
        { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 12%;', tdClass: 'text-left' },
        { key: 'eventType', label: 'Event Type', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-left' },
        { key: 'info', label: 'Info', sortable: false, thStyle: 'width: 37%;', tdClass: 'text-left' },
      ],
      approvalsFields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'when', label: 'When', sortable: false, thStyle: 'width: 15%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'token', label: 'Token', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        { key: 'eventType', label: 'Type', sortable: false, thStyle: 'width: 10%;', tdClass: 'text-left' },
        { key: 'owner', label: 'Owner', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        { key: 'spenderOperator', label: 'Spender / Operator', sortable: false, thStyle: 'width: 15%;', tdClass: 'text-left' },
        { key: 'tokensApproved', label: 'Tokens / Approved', sortable: false, thStyle: 'width: 25%;', tdClass: 'text-left' },
      ],
      fields: [
        { key: 'number', label: '#', sortable: false, thStyle: 'width: 5%;', tdClass: 'text-truncate' },
        { key: 'tokenAgent', label: 'Token Agent', sortable: false, thStyle: 'width: 55%;', thClass: 'text-left', tdClass: 'text-left' },
        { key: 'owner', label: 'Owner', sortable: false, thStyle: 'width: 45%;', tdClass: 'text-left' },
        // TODO: Deploy new TokenContractFactory with index worked out
        // { key: 'index', label: 'Index', sortable: false, thStyle: 'width: 10%;', thClass: 'text-right', tdClass: 'text-right' },
      ],
    }
  },
  computed: {
    chainId() {
      return store.getters['connection/chainId'];
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

    totalRegistryEntries() {
      return Object.keys(this.registry[this.chainId] || {}).length + ((store.getters['data/forceRefresh'] % 2) == 0 ? 0 : 0);
    },
    items() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [tokenAgent, d] of Object.entries(this.tokenAgents[this.chainId] || {})) {
        // console.log(tokenAgent + " => " + JSON.stringify(d));
        results.push({ tokenAgent, owner: d.owner, index: d.index });
      }
      return results;
    },
    filteredSortedItems() {
      const results = this.items;
      // console.log(JSON.stringify(results, null, 2));
      if (this.settings.sortOption == 'ownertokenagentasc') {
        results.sort((a, b) => {
          if (('' + a.owner).localeCompare(b.owner) == 0) {
            return ('' + a.transferAgent).localeCompare(b.transferAgent);
          } else {
            return ('' + a.owner).localeCompare(b.owner);
          }
        });
      } else if (this.settings.sortOption == 'ownertokenagentdsc') {
        results.sort((a, b) => {
          if (('' + a.owner).localeCompare(b.owner) == 0) {
            return ('' + a.transferAgent).localeCompare(b.transferAgent);
          } else {
            return ('' + b.owner).localeCompare(a.owner);
          }
        });
      } else if (this.settings.sortOption == 'tokenagentasc') {
        results.sort((a, b) => {
          return ('' + a.tokenAgent).localeCompare(b.tokenAgent);
        });
      } else if (this.settings.sortOption == 'tokenagentdsc') {
        results.sort((a, b) => {
          return ('' + b.tokenAgent).localeCompare(a.tokenAgent);
        });
      } else if (this.settings.sortOption == 'indexasc') {
        results.sort((a, b) => {
          return a.index - b.index;
        });
      } else if (this.settings.sortOption == 'indexdsc') {
        results.sort((a, b) => {
          return b.index - a.index;
        });
      }
      return results;
    },
    pagedFilteredSortedItems() {
      // console.log(now() + " INFO TradeFungibles:computed.pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
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

      // console.log(now() + " INFO TradeFungibles:computed.sellOffers - this.sellByMakers: " + JSON.stringify(this.sellByMakers, null, 2));
      for (const [maker, d1] of Object.entries(this.sellByMakers)) {
        console.log("SELL - maker: " + maker + ", tokenBalance: " + ethers.utils.formatEther(d1.tokenBalance));
        for (const [tokenAgent, d2] of Object.entries(d1.tokenAgents)) {
          let tokenApproval = ethers.BigNumber.from(d2.tokenApproval);
          // let tokenApproval = ethers.BigNumber.from("1230000000000000000");
          console.log("  tokenAgent: " + tokenAgent + ", tokenApproval: " + ethers.utils.formatEther(tokenApproval), " events: " + JSON.stringify(d2.events));
          // const prices = [];
          // for (const offerIndex of d2.events) {
          //   const o = this.data.tokenAgents[tokenAgent].offers[offerIndex];
          //   // console.log("SELL Offer " + offerIndex + " " + JSON.stringify(o));
          // }
          // console.log("d2.prices: " + JSON.stringify(d2.prices));
          // for (const [i, e] of d2.events.entries()) {
          //   console.log("    offerIndex: " + i + " blockNumber: " + e.blockNumber + ", prices: [" + e.prices.map(e => ethers.utils.formatEther(e)).join(',') + "], tokenss: [" + e.tokenss.map(e => ethers.utils.formatEther(e)).join(',') + "]");
          // }
          d2.prices.sort((a, b) => {
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
          for (const [i, e] of d2.prices.entries()) {
            const o = this.data.tokenAgents[tokenAgent].offers[e.offerIndex];
            const tokens = ethers.BigNumber.from(e.tokens);
            const tokensAvailable = tokens.lte(tokenApproval) ? tokens : tokenApproval;
            tokenApproval = tokenApproval.sub(tokensAvailable);
            console.log("    priceIndex: " + i + ", offerIndex: " + e.offerIndex + ", price: " + ethers.utils.formatEther(e.price) + ", tokens: " + ethers.utils.formatEther(e.tokens) + ", tokensAvailable: " + ethers.utils.formatEther(tokensAvailable) + ", tokenApproval: " + ethers.utils.formatEther(tokenApproval));
            if (tokensAvailable.gt(0)) {
              results.push({
                blockNumber: o.blockNumber, txIndex: o.txIndex, txHash: o.txHash, logIndex: o.logIndex,
                maker, tokenAgent, tokenAgentIndexByOwner: this.data.tokenAgents[tokenAgent].indexByOwner, offerIndex: e.offerIndex, priceIndex: i, price: e.price, tokens: tokensAvailable.toString(),
              });
            }
          }
        }
      }
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
      // console.log(now() + " INFO TradeFungibles:computed.buyOffers - this.buyByMakers: " + JSON.stringify(this.buyByMakers, null, 2));
      for (const [maker, d1] of Object.entries(this.buyByMakers)) {
        console.log("BUY - maker: " + maker + ", wethBalance: " + ethers.utils.formatEther(d1.wethBalance));
        for (const [tokenAgent, d2] of Object.entries(d1.tokenAgents)) {
          let wethApproval = ethers.BigNumber.from(d2.wethApproval);
          // let wethApproval = ethers.BigNumber.from("100000000000001234");
          console.log("  tokenAgent: " + tokenAgent + ", wethApproval: " + ethers.utils.formatEther(wethApproval), " events: " + JSON.stringify(d2.events));
          // for (const [i, e] of d2.events.entries()) {
          //   console.log("    Offer " + i + " blockNumber: " + e.blockNumber + ", prices: [" + e.prices.map(e => ethers.utils.formatEther(e)).join(',') + "], tokenss: [" + e.tokenss.map(e => ethers.utils.formatEther(e)).join(',') + "]");
          // }
          d2.prices.sort((a, b) => {
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
          for (const [i, e] of d2.prices.entries()) {
            const o = this.data.tokenAgents[tokenAgent].offers[e.offerIndex];
            const tokens = ethers.BigNumber.from(e.tokens);
            const tokensApproved = wethApproval.mul(TENPOW18).div(e.price);
            const tokensAvailable = tokens.lte(tokensApproved) ? tokens : tokensApproved;
            const wethAmount = tokensAvailable.mul(ethers.BigNumber.from(e.price)).div(TENPOW18);
            // const wethAvailable = wethAmount.lte(wethApproval) ? wethAmount : wethApproval;
            wethApproval = wethApproval.sub(wethAmount);
            console.log("    priceIndex: " + i + ", offerIndex: " + e.offerIndex + ", price: " + ethers.utils.formatEther(e.price) + ", tokens: " + ethers.utils.formatEther(e.tokens) + ", tokensAvailable: " + ethers.utils.formatEther(tokensAvailable) + ", wethAmount: " + ethers.utils.formatEther(wethAmount) + ", wethApproval: " + ethers.utils.formatEther(wethApproval));
            if (tokensAvailable.gt(0)) {
              results.push({
                blockNumber: o.blockNumber, txIndex: o.txIndex, txHash: o.txHash, logIndex: o.logIndex,
                maker, tokenAgent, tokenAgentIndexByOwner: this.data.tokenAgents[tokenAgent].indexByOwner, offerIndex: e.offerIndex, priceIndex: i, price: e.price, tokens: tokensAvailable.toString(),
              });
            }
          }
        }
      }
      // console.log(now() + " INFO TradeFungibles:computed.buyOffers - results: " + JSON.stringify(results, null, 2));
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


    filteredSortedEvents() {
      const results = this.events;
      if (this.settings.events.sortOption == 'txorderasc') {
        results.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return a.logIndex - b.logIndex;
          } else {
            return a.blockNumber - b.blockNumber;
          }
        });
      } else if (this.settings.events.sortOption == 'txorderdsc') {
        results.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return b.logIndex - a.logIndex;
          } else {
            return b.blockNumber - a.blockNumber;
          }
        });
      }
      return results;
    },
    pagedFilteredSortedEvents() {
      console.log(now() + " INFO TradeFungibles:computed.pagedFilteredSortedEvents - results[0..1]: " + JSON.stringify(this.filteredSortedEvents.slice(0, 2), null, 2));
      return this.filteredSortedEvents.slice((this.settings.events.currentPage - 1) * this.settings.events.pageSize, this.settings.events.currentPage * this.settings.events.pageSize);
    },

    offers() {
      return this.events.filter(e => e.eventType == "Offered");
    },
    filteredSortedOffers() {
      const results = this.offers;
      if (this.settings.offers.sortOption == 'txorderasc') {
        results.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return a.logIndex - b.logIndex;
          } else {
            return a.blockNumber - b.blockNumber;
          }
        });
      } else if (this.settings.offers.sortOption == 'txorderdsc') {
        results.sort((a, b) => {
          if (a.blockNumber == b.blockNumber) {
            return b.logIndex - a.logIndex;
          } else {
            return b.blockNumber - a.blockNumber;
          }
        });
      }
      return results;
    },
    pagedFilteredSortedOffers() {
      console.log(now() + " INFO TradeFungibles:computed.pagedFilteredSortedOffers - results[0..1]: " + JSON.stringify(this.filteredSortedOffers.slice(0, 2), null, 2));
      return this.filteredSortedOffers.slice((this.settings.offers.currentPage - 1) * this.settings.offers.pageSize, this.settings.offers.currentPage * this.settings.offers.pageSize);
    },

    filteredSortedApprovals() {
      const results = this.approvals;
      // console.log(JSON.stringify(results, null, 2));
      // if (this.settings.sortOption == 'ownertokenagentasc') {
      //   results.sort((a, b) => {
      //     if (('' + a.owner).localeCompare(b.owner) == 0) {
      //       return ('' + a.transferAgent).localeCompare(b.transferAgent);
      //     } else {
      //       return ('' + a.owner).localeCompare(b.owner);
      //     }
      //   });
      // } else if (this.settings.sortOption == 'ownertokenagentdsc') {
      //   results.sort((a, b) => {
      //     if (('' + a.owner).localeCompare(b.owner) == 0) {
      //       return ('' + a.transferAgent).localeCompare(b.transferAgent);
      //     } else {
      //       return ('' + b.owner).localeCompare(a.owner);
      //     }
      //   });
      // } else if (this.settings.sortOption == 'tokenagentasc') {
      //   results.sort((a, b) => {
      //     return ('' + a.tokenAgent).localeCompare(b.tokenAgent);
      //   });
      // } else if (this.settings.sortOption == 'tokenagentdsc') {
      //   results.sort((a, b) => {
      //     return ('' + b.tokenAgent).localeCompare(a.tokenAgent);
      //   });
      // } else if (this.settings.sortOption == 'indexasc') {
      //   results.sort((a, b) => {
      //     return a.index - b.index;
      //   });
      // } else if (this.settings.sortOption == 'indexdsc') {
      //   results.sort((a, b) => {
      //     return b.index - a.index;
      //   });
      // }
      return results;
    },
    pagedFilteredSortedApprovals() {
      console.log(now() + " INFO TradeFungibles:computed.pagedFilteredSortedApprovals - results[0..1]: " + JSON.stringify(this.filteredSortedApprovals.slice(0, 2), null, 2));
      return this.filteredSortedApprovals.slice((this.settings.approvals.currentPage - 1) * this.settings.approvals.pageSize, this.settings.approvals.currentPage * this.settings.approvals.pageSize);
    },

  },
  methods: {
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
              // event Offered(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
              ethers.utils.id("Offered(uint32,address,uint8,address,uint8,uint40,uint16,uint24,uint128[],uint256[],uint128[],uint40)"),
              // TODO event OfferUpdated(Index index, Token indexed token, TokenType tokenType, Account indexed maker, BuySell buySell, Unixtime expiry, Count count, Nonce nonce, Price[] prices, TokenId[] tokenIds, Tokens[] tokenss, Unixtime timestamp);
              // TODO event Traded(Index index, Token indexed token, TokenType tokenType, Account indexed taker, Account indexed maker, BuySell makerBuySell, uint[] prices, uint[] tokenIds, uint[] tokenss, Price price, Unixtime timestamp);
            ],
            [ '0x000000000000000000000000' + this.settings.tokenContractAddress.substring(2, 42).toLowerCase() ],
            null,
          ]};
        const tokenAgentEventLogs = await provider.getLogs(tokenAgentEventsfilter);
        const tokenAgentEvents = parseTokenAgentEventLogs(tokenAgentEventLogs, this.chainId, this.settings.tokenAgentAddress, network.tokenAgent.abi, blockNumber);
        // Vue.set(this.data, 'buyEvents', tokenAgentEvents.filter(e => e.buySell == 0));
        // Vue.set(this.data, 'sellEvents', tokenAgentEvents.filter(e => e.buySell == 1));

        for (const e of tokenAgentEvents) {
          if (e.contract in tokenAgents && e.eventType == "Offered") {
            tokenAgents[e.contract].offers[e.index] = e;
          }
        }
        // console.log("tokenAgents: " + JSON.stringify(tokenAgents));
        Vue.set(this.data, 'tokenAgents', tokenAgents);

        // TODO: const balance = await provider.getBalance(e.maker);
        const approvalAddressMap = {};
        const balanceAddressMap = {};
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
        // console.log(now() + " INFO TradeFungibles:methods.loadData - wethTransferFromEvents: " + JSON.stringify(wethTransferFromEvents));

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

    async computeState() {
      // console.log(now() + " INFO TradeFungibles:methods.computeState");
      const balanceAddressMap = {};
      for (const a of this.data.balanceAddresses) {
        balanceAddressMap[a] = 1;
      }
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
      console.log(now() + " INFO TradeFungibles:methods.computeState - wethBalances: " + JSON.stringify(wethBalances));

      const tokenApprovals = {};
      for (const e of this.data.tokenApprovals) {
        if (!(e.owner in tokenApprovals)) {
          tokenApprovals[e.owner] = {};
        }
        tokenApprovals[e.owner][e.spender] = e.tokens;
      }
      console.log(now() + " INFO TradeFungibles:methods.computeState - tokenApprovals: " + JSON.stringify(tokenApprovals));
      const wethApprovals = {};
      for (const e of this.data.wethApprovals) {
        if (!(e.owner in wethApprovals)) {
          wethApprovals[e.owner] = {};
        }
        wethApprovals[e.owner][e.spender] = e.tokens;
      }
      console.log(now() + " INFO TradeFungibles:methods.computeState - wethApprovals: " + JSON.stringify(wethApprovals));

      // TODO: Handle null tokens, and compute available balance, ideally across tokenAgents by makers
      const sellByMakers = {};
      const buyByMakers = {};
      for (const [tokenAgent, d] of Object.entries(this.data.tokenAgents)) {
        for (const [offerIndex, o] of Object.entries(d.offers)) {
          if (d.nonce == o.nonce && (o.expiry == 0 || o.expiry > this.data.timestamp)) {
            if (o.buySell == 1) {
              // console.log("SELL " + tokenAgent + "/" + offerIndex + " => " + JSON.stringify(o));
              if (!(o.maker in sellByMakers)) {
                sellByMakers[o.maker] = {
                  tokenBalance: tokenBalances[o.maker] && tokenBalances[o.maker].tokens || 0,
                  tokenAgents: {},
                }
              }
              if (!(o.contract in sellByMakers[o.maker].tokenAgents)) {
                sellByMakers[o.maker].tokenAgents[o.contract] = {
                  tokenApproval: tokenApprovals[o.maker] && tokenApprovals[o.maker][o.contract] || 0,
                  prices: [],
                  events: [],
                }
              }
              sellByMakers[o.maker].tokenAgents[o.contract].events.push(o.index);
              if (o.prices.length == 1 && o.tokenss.length == 0) {
                sellByMakers[o.maker].tokenAgents[o.contract].prices.push({ offerIndex: o.index, priceIndex: 0, price: o.prices[0], tokens: null });
              } else {
                for (let i = 0; i < o.prices.length; i++) {
                  sellByMakers[o.maker].tokenAgents[o.contract].prices.push({ offerIndex: o.index, priceIndex: i, price: o.prices[i], tokens: o.tokenss[i] });
                }
              }
            }
            if (o.buySell == 0) {
              // console.log("BUY " + tokenAgent + "/" + offerIndex + " => " + JSON.stringify(o));
              if (!(o.maker in buyByMakers)) {
                buyByMakers[o.maker] = {
                  wethBalance: wethBalances[o.maker] && wethBalances[o.maker].tokens || 0,
                  tokenAgents: {},
                }
              }
              if (!(o.contract in buyByMakers[o.maker].tokenAgents)) {
                buyByMakers[o.maker].tokenAgents[o.contract] = {
                  wethApproval: wethApprovals[o.maker] && wethApprovals[o.maker][o.contract] || 0,
                  prices: [],
                  events: [],
                }
              }
              buyByMakers[o.maker].tokenAgents[o.contract].events.push(o.index);
              if (o.prices.length == 1 && o.tokenss.length == 0) {
                buyByMakers[o.maker].tokenAgents[o.contract].prices.push({ offerIndex: o.index, priceIndex: 0, price: o.prices[0], tokens: null });
              } else {
                for (let i = 0; i < o.prices.length; i++) {
                  buyByMakers[o.maker].tokenAgents[o.contract].prices.push({ offerIndex: o.index, priceIndex: i, price: o.prices[i], tokens: o.tokenss[i] });
                }
              }
            }
          }
        }
      }

      // console.log("SELL - sellByMakers: " + JSON.stringify(sellByMakers, null, 2));
      // console.log("BUY - buyByMakers: " + JSON.stringify(buyByMakers, null, 2));

      // for (const e of this.data.sellEvents) {
      //   const tokenAgent = this.data.tokenAgents[e.contract] || null;
      //   if (tokenAgent && tokenAgent.nonce == e.nonce && e.expiry > this.data.timestamp) {
      //     if (!(e.maker in sellByMakers)) {
      //       const tokenBalance = tokenBalances[e.maker] && tokenBalances[e.maker].tokens || 0;
      //       sellByMakers[e.maker] = {
      //         tokenBalance,
      //         tokenAgents: {},
      //       }
      //     }
      //     if (!(e.contract in sellByMakers[e.maker].tokenAgents)) {
      //       const tokenApproval = tokenApprovals[e.maker] && tokenApprovals[e.maker][e.contract] || 0;
      //       sellByMakers[e.maker].tokenAgents[e.contract] = {
      //         tokenApproval,
      //         prices: [],
      //         events: [],
      //       }
      //     }
      //     const offerIndex = sellByMakers[e.maker].tokenAgents[e.contract].events.length;
      //     sellByMakers[e.maker].tokenAgents[e.contract].events.push(e);
      //     if (e.prices.length == 1 && e.tokenss.length == 0) {
      //       sellByMakers[e.maker].tokenAgents[e.contract].prices.push({ offerIndex, itemIndex: 0, price: e.prices[0], tokens: null });
      //     } else {
      //       for (let i = 0; i < e.prices.length; i++) {
      //         sellByMakers[e.maker].tokenAgents[e.contract].prices.push({ offerIndex, itemIndex: i, price: e.prices[i], tokens: e.tokenss[i] });
      //       }
      //     }
      //   }
      // }
      // if (false) {
      //   for (const [maker, d1] of Object.entries(sellByMakers)) {
      //     console.log("SELL - maker: " + maker + ", tokenBalance: " + ethers.utils.formatEther(d1.tokenBalance));
      //     for (const [tokenAgent, d2] of Object.entries(d1.tokenAgents)) {
      //       let tokenApproval = ethers.BigNumber.from(d2.tokenApproval);
      //       // let tokenApproval = ethers.BigNumber.from("1230000000000000000");
      //       console.log("  tokenAgent: " + tokenAgent + ", tokenApproval: " + ethers.utils.formatEther(tokenApproval));
      //       for (const [i, e] of d2.events.entries()) {
      //         console.log("    offerIndex: " + i + " blockNumber: " + e.blockNumber + ", prices: [" + e.prices.map(e => ethers.utils.formatEther(e)).join(',') + "], tokenss: [" + e.tokenss.map(e => ethers.utils.formatEther(e)).join(',') + "]");
      //       }
      //       d2.prices.sort((a, b) => {
      //         const aP = ethers.BigNumber.from(a.price);
      //         const aT = a.tokens != null && ethers.BigNumber.from(a.tokens) || null;
      //         const bP = ethers.BigNumber.from(b.price);
      //         const bT = b.tokens != null && ethers.BigNumber.from(b.tokens) || null;
      //         if (aP.eq(bP)) {
      //           if (aT == null) {
      //             return 1;
      //           } else if (bT == null) {
      //             return -1;
      //           } else {
      //             return aT.lt(bT) ? 1 : -1;
      //           }
      //         } else {
      //           return aP.lt(bP) ? -1 : 1;
      //         }
      //       });
      //       for (const [i, e] of d2.prices.entries()) {
      //         const tokens = ethers.BigNumber.from(e.tokens);
      //         const tokensAvailable = tokens.lte(tokenApproval) ? tokens : tokenApproval;
      //         tokenApproval = tokenApproval.sub(tokensAvailable);
      //         console.log("    priceIndex: " + i + ", offerIndex: " + e.offerIndex + ", price: " + ethers.utils.formatEther(e.price) + ", tokens: " + ethers.utils.formatEther(e.tokens) + ", tokensAvailable: " + ethers.utils.formatEther(tokensAvailable) + ", tokenApproval: " + ethers.utils.formatEther(tokenApproval));
      //       }
      //     }
      //   }
      // }
      // console.log("SELL - sellByMakers: " + JSON.stringify(sellByMakers, null, 2));
      Vue.set(this, 'sellByMakers', sellByMakers);

      // // const buyByMakers = {};
      // const TENPOW18 = ethers.BigNumber.from("1000000000000000000");
      // for (const e of this.data.buyEvents) {
      //   const tokenAgent = this.data.tokenAgents[e.contract] || null;
      //   if (tokenAgent && tokenAgent.nonce == e.nonce && e.expiry > this.data.timestamp) {
      //     if (!(e.maker in buyByMakers)) {
      //       const wethBalance = wethBalances[e.maker] && wethBalances[e.maker].tokens || 0;
      //       buyByMakers[e.maker] = {
      //         wethBalance,
      //         tokenAgents: {},
      //       }
      //     }
      //     if (!(e.contract in buyByMakers[e.maker].tokenAgents)) {
      //       const wethApproval = wethApprovals[e.maker] && wethApprovals[e.maker][e.contract] || 0;
      //       buyByMakers[e.maker].tokenAgents[e.contract] = {
      //         wethApproval,
      //         prices: [],
      //         events: [],
      //       }
      //     }
      //     const offerIndex = buyByMakers[e.maker].tokenAgents[e.contract].events.length;
      //     buyByMakers[e.maker].tokenAgents[e.contract].events.push(e);
      //     if (e.prices.length == 1 && e.tokenss.length == 0) {
      //       buyByMakers[e.maker].tokenAgents[e.contract].prices.push({ offerIndex, itemIndex: 0, price: e.prices[0], tokens: null });
      //     } else {
      //       for (let i = 0; i < e.prices.length; i++) {
      //         buyByMakers[e.maker].tokenAgents[e.contract].prices.push({ offerIndex, itemIndex: i, price: e.prices[i], tokens: e.tokenss[i] });
      //       }
      //     }
      //
      //   }
      // }
      // if (false) {
      //   for (const [maker, d1] of Object.entries(buyByMakers)) {
      //     console.log("BUY - maker: " + maker + ", wethBalance: " + ethers.utils.formatEther(d1.wethBalance));
      //     for (const [tokenAgent, d2] of Object.entries(d1.tokenAgents)) {
      //       let wethApproval = ethers.BigNumber.from(d2.wethApproval);
      //       // let wethApproval = ethers.BigNumber.from("100000000000001234");
      //       console.log("  tokenAgent: " + tokenAgent + ", wethApproval: " + ethers.utils.formatEther(wethApproval));
      //       for (const [i, e] of d2.events.entries()) {
      //         console.log("    Offer " + i + " blockNumber: " + e.blockNumber + ", prices: [" + e.prices.map(e => ethers.utils.formatEther(e)).join(',') + "], tokenss: [" + e.tokenss.map(e => ethers.utils.formatEther(e)).join(',') + "]");
      //       }
      //       d2.prices.sort((a, b) => {
      //         const aP = ethers.BigNumber.from(a.price);
      //         const aT = a.tokens != null && ethers.BigNumber.from(a.tokens) || null;
      //         const bP = ethers.BigNumber.from(b.price);
      //         const bT = b.tokens != null && ethers.BigNumber.from(b.tokens) || null;
      //         if (aP.eq(bP)) {
      //           if (aT == null) {
      //             return 1;
      //           } else if (bT == null) {
      //             return -1;
      //           } else {
      //             return aT.lt(bT) ? 1 : -1;
      //           }
      //         } else {
      //           return aP.lt(bP) ? 1 : -1;
      //         }
      //       });
      //       for (const [i, e] of d2.prices.entries()) {
      //         const tokens = ethers.BigNumber.from(e.tokens);
      //         const tokensApproved = wethApproval.mul(TENPOW18).div(e.price);
      //         const tokensAvailable = tokens.lte(tokensApproved) ? tokens : tokensApproved;
      //         const wethAmount = tokensAvailable.mul(ethers.BigNumber.from(e.price)).div(TENPOW18);
      //         // const wethAvailable = wethAmount.lte(wethApproval) ? wethAmount : wethApproval;
      //         wethApproval = wethApproval.sub(wethAmount);
      //         console.log("    priceIndex: " + i + ", offerIndex: " + e.offerIndex + ", price: " + ethers.utils.formatEther(e.price) + ", tokens: " + ethers.utils.formatEther(e.tokens) + ", tokensAvailable: " + ethers.utils.formatEther(tokensAvailable) + ", wethAmount: " + ethers.utils.formatEther(wethAmount) + ", wethApproval: " + ethers.utils.formatEther(wethApproval));
      //       }
      //     }
      //   }
      // }
      // console.log("BUY - buyByMakers: " + JSON.stringify(sellByMakers, null, 2));
      Vue.set(this, 'buyByMakers', buyByMakers);

    },

    sellOffersRowSelected(item) {
      console.log(now() + " INFO Addresses:methods.sellOffersRowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        // const account = item[0].account;
        // if (account.substring(0, 3) == "st:") {
        //   store.dispatch('viewStealthMetaAddress/viewStealthMetaAddress', item[0].account);
        // } else {
        //   store.dispatch('viewAddress/viewAddress', item[0].account);
        // }
        this.$refs.modalselloffer.show();
        this.$refs.sellOffersTable.clearSelected();
      }
    },

    buyOffersRowSelected(item) {
      console.log(now() + " INFO Addresses:methods.buyOffersRowSelected BEGIN: " + JSON.stringify(item, null, 2));
      if (item && item.length > 0) {
        // const account = item[0].account;
        // if (account.substring(0, 3) == "st:") {
        //   store.dispatch('viewStealthMetaAddress/viewStealthMetaAddress', item[0].account);
        // } else {
        //   store.dispatch('viewAddress/viewAddress', item[0].account);
        // }
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
