const Agent = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">

        <b-tabs card v-model="settings.tabIndex" @changed="saveSettings();" content-class="mt-0" align="left">
          <template #tabs-start>
            <div class="d-flex flex-wrap m-0 p-0">
              <div class="mt-0 pr-0" style="width: 24.0rem;">
                <b-form-group :state="!settings.tokenAgentAddress || validAddress(settings.tokenAgentAddress)" :invalid-feedback="'Invalid address'" class="m-0 p-0">
                  <b-form-input type="text" size="sm" id="explorer-tokenAgentAddress" v-model="settings.tokenAgentAddress" @change="saveSettings(); loadData(settings.contract);" placeholder="Token agent address, or select from dropdown"></b-form-input>
                </b-form-group>
              </div>
              <!-- TODO WIP -->
              <!-- <div class="mt-0 pr-1">
                <b-button size="sm" @click="showModalAddTokenContract" variant="link" v-b-popover.hover.ds500="'WIP: Search for token contracts'"><b-icon-search shift-v="+0" font-scale="1.2"></b-icon-search></b-button>
              </div> -->
              <div class="mt-0 pr-0">
                <b-dropdown size="sm" id="dropdown-left" text="" variant="link" v-b-popover.hover.ds500="'Existing Token Agents'" class="m-0 ml-1 p-0">
                  <b-dropdown-item v-if="tokenAgentsDropdownOptions.length == 0" disabled>No Token Agents contracts on this network</b-dropdown-item>
                  <div v-for="(item, index) of tokenAgentsDropdownOptions" v-bind:key="index">
                    <!-- <b-dropdown-item @click="settings.tokenAgentAddress = item.tokenAgent; saveSettings(); loadData(settings.contract);">{{ index }}. {{ 'ERC-' + item.type }} {{ item.contract.substring(0, 8) + '...' + item.contract.slice(-6) + ' ' + item.name }}</b-dropdown-item> -->
                    <b-dropdown-item @click="settings.tokenAgentAddress = item.tokenAgent; settings.tokenAgentOwner = item.owner; saveSettings(); loadData(settings.tokenAgentAddress);">{{ index }}. {{ item.tokenAgent.substring(0, 8) + '...' + item.tokenAgent.slice(-6) + ' ' + item.owner.substring(0, 8) + '...' + item.owner.slice(-6) }}</b-dropdown-item>
                  </div>
                </b-dropdown>
              </div>
              <div class="mt-0 pr-1">
                <b-button size="sm" :disabled="!validAddress(settings.tokenAgentAddress)" :href="explorer + 'address/' + settings.tokenAgentAddress + '#code'" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
              </div>
              <div class="mt-0 pr-1">
                <b-button size="sm" :disabled="sync.completed != null || !validAddress(settings.tokenAgentAddress)" @click="loadData(settings.tokenAgentAddress);" variant="primary">Retrieve</b-button>
              </div>
              <!-- <div class="mt-0 pr-1">
                <b-button :disabled="!settings.contract || !validAddress(settings.contract)" @click="copyToClipboard(settings.contract);" variant="link" v-b-popover.hover.ds500="'Copy ERC-20 contract address to clipboard'" class="m-0 ml-2 p-0"><b-icon-clipboard shift-v="+1" font-scale="1.1"></b-icon-clipboard></b-button>
              </div> -->
              <div class="mt-0 pr-1" style="width: 23.0rem;">
                <font size="-1">
                  <b-link :href="explorer + 'address/' + settings.tokenAgentOwner" v-b-popover.hover.ds500="'Token Agent owner ' + settings.tokenAgentOwner" target="_blank">
                    <b-badge v-if="settings.tokenAgentOwner" variant="link" class="m-0 mt-1">
                      {{ settings.tokenAgentOwner.substring(0, 10) + '...' + settings.tokenAgentOwner.slice(-8) }}
                    </b-badge>
                  </b-link>

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
              <!-- <span v-b-popover.hover.ds500="'Token Agent Console'">Console</span> -->
              Console
            </template>
          </b-tab>
          <b-tab no-body>
            <template #title>
              <!-- <span v-b-popover.hover.ds500="'Token Agent Orders'">Orders</span> -->
              Orders
            </template>
          </b-tab>
          <b-tab no-body>
            <template #title>
              <!-- <span v-b-popover.hover.ds500="'Token Agent Events'">Events</span> -->
              Events
            </template>
          </b-tab>
        </b-tabs>

        <b-card v-if="settings.tabIndex == 0" class="m-0 p-0 border-0" body-class="m-0 p-2">
          <b-card bg-variant="light">
            <b-form-group label-cols-lg="2" label="Add Offers" label-size="lg" label-class="font-weight-bold pt-0" class="mb-0">

              <b-form-group label="Token:" label-for="addoffers-token" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!settings.addOffers.token || validAddress(settings.addOffers.token)" :invalid-feedback="'Invalid address'" :description="settings.addOffers.token && validAddress(settings.addOffers.token) && settings.addOffers.type && ('ERC-' + settings.addOffers.type) || 'Enter address'" class="mx-0 my-1 p-0">
                <b-input-group style="width: 28.0rem;">
                  <b-form-input size="sm" id="addoffers-token" v-model.trim="settings.addOffers.token" @change="saveSettings" placeholder="Token address, or select from dropdown"></b-form-input>
                  <b-input-group-append>
                    <b-dropdown size="sm" id="dropdown-left" text="" variant="link" v-b-popover.hover.ds500="'Token contracts'" class="m-0 ml-1 p-0">
                      <b-dropdown-item v-if="tokenContractsDropdownOptions.length == 0" disabled>No Token contracts contracts with transfers permitted</b-dropdown-item>
                      <div v-for="(item, index) of tokenContractsDropdownOptions" v-bind:key="index">
                        <b-dropdown-item @click="settings.addOffers.token = item.tokenContract; settings.addOffers.type = item.type; saveSettings();">{{ index }}. {{ item.tokenContract.substring(0, 8) + '...' + item.tokenContract.slice(-6) + ' ' + item.symbol + ' ' + item.name }}</b-dropdown-item>
                      </div>
                    </b-dropdown>
                    <b-button size="sm" :disabled="!validAddress(settings.addOffers.token)" :href="explorer + 'token/' + settings.addOffers.token" variant="link" v-b-popover.hover.ds500="'View in explorer'" target="_blank" class="m-0 mt-1 ml-2 mr-2 p-0"><b-icon-link45deg shift-v="-1" font-scale="1.2"></b-icon-link45deg></b-button>
                    <!-- <font size="-1">
                      <b-badge v-if="settings.addOffers.type" variant="light" class="mt-2" v-b-popover.hover.ds500="'ERC-20/721/1155'">{{ 'ERC-' + settings.addOffers.type }}</b-badge>
                    </font> -->
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>

              <!-- <b-form-group label="Token:" label-for="addoffers-token" label-size="sm" label-cols-sm="3" label-align-sm="right" :state="!settings.addOffers.token || validAddress(settings.addOffers.token)" :invalid-feedback="'Invalid address'" class="mx-0 my-1 p-0">
                <b-form-input size="sm" id="addoffers-token" v-model.trim="settings.addOffers.token" @change="saveSettings" placeholder="Token address, e.g., 0x1234...6789" class="w-50"></b-form-input>
              </b-form-group> -->
              <b-form-group label="Buy/Sell:" label-for="addoffers-buysell" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="addoffers-buysell" v-model="settings.addOffers.buySell" @change="saveSettings" :options="buySellOptions" v-b-popover.hover.ds500="'Owner BUY or SELL'" class="w-25"></b-form-select>
              </b-form-group>
              <b-form-group v-if="settings.addOffers.type == 721 || settings.addOffers.type == 1155" label="Count:" label-for="addoffers-count" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-input size="sm" type="number" id="addoffers-count" v-model.trim="settings.addOffers.count" @change="saveSettings" class="w-25"></b-form-input>
              </b-form-group>
              <b-form-group v-if="settings.addOffers.type == 721 || settings.addOffers.type == 1155" label="Pricing:" label-for="addoffers-pricing" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <b-form-select size="sm" id="addoffers-pricing" v-model="settings.addOffers.pricing" @change="saveSettings" :options="pricingOptions" v-b-popover.hover.ds500="'Single or multiple prices'" class="w-25"></b-form-select>
              </b-form-group>
            </b-form-group>
            <b-form-group label-cols-lg="2" label="" label-size="lg" label-class="font-weight-bold pt-0" class="mt-3">
              <b-form-group label="" label-size="sm" label-cols-sm="3" label-align-sm="right" class="mx-0 my-1 p-0">
                <font size="-2">
                  <pre>
  addOffers: {
    offers: [],
    token: null,
    buySell: 0,
    count: null,
    pricing: 0,
    expiry: null,
    prices: [],
    tokenIds: [],
    tokenss: [],
  }
                  </pre>
                </font>
              </b-form-group>
            </b-form-group>
          </b-card>
        </b-card>
        <b-card v-if="settings.tabIndex == 1" class="m-0 p-0 border-0" body-class="m-1 p-0">
          Orders
        </b-card>
        <b-card v-if="settings.tabIndex == 2" class="m-0 p-0 border-0" body-class="m-1 p-0">
          Events
        </b-card>

        <div v-if="false" class="d-flex flex-wrap m-0 p-0">
          <div class="mt-0 flex-grow-1">
          </div>
          <div v-if="sync.section == null" class="mt-0 pr-1">
            <b-button size="sm" :disabled="!networkSupported" @click="viewSyncOptions" variant="link" v-b-popover.hover.ds500="'Sync data from the blockchain'"><b-icon-arrow-repeat shift-v="+1" font-scale="1.2"></b-icon-arrow-repeat></b-button>
          </div>
          <div v-if="sync.section != null" class="mt-1" style="width: 300px;">
            <b-progress height="1.5rem" :max="sync.total" show-progress :animated="sync.section != null" :variant="sync.section != null ? 'success' : 'secondary'" v-b-popover.hover.ds500="'Click the button on the right to stop. This process can be continued later'">
              <b-progress-bar :value="sync.completed">
                {{ sync.total == null ? (sync.completed + ' ' + sync.section) : (sync.completed + '/' + sync.total + ' ' + ((sync.completed / sync.total) * 100).toFixed(0) + '% ' + sync.section) }}
              </b-progress-bar>
            </b-progress>
          </div>
          <div class="ml-0 mt-1">
            <b-button v-if="sync.section != null" size="sm" @click="halt" variant="link" v-b-popover.hover.ds500="'Click to stop. This process can be continued later'"><b-icon-stop-fill shift-v="+1" font-scale="1.0"></b-icon-stop-fill></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-button size="sm" :disabled="!transferHelper" @click="newTransfer(null); " variant="link" v-b-popover.hover.ds500="'New Stealth Transfer'"><b-icon-caret-right shift-v="+1" font-scale="1.1"></b-icon-caret-right></b-button>
          </div>
          <div class="mt-0 flex-grow-1">
          </div>
          <div class="mt-0 pr-1">
            <b-form-select size="sm" v-model="settings.sortOption" @change="saveSettings" :options="sortOptions" v-b-popover.hover.ds500="'Yeah. Sort'"></b-form-select>
          </div>
          <div class="mt-0 pr-1">
            <font size="-2" v-b-popover.hover.ds500="'# filtered / all entries'">{{ filteredSortedItems.length + '/' + items.length }}</font>
          </div>
          <div class="mt-0 pr-1">
            <b-pagination size="sm" v-model="settings.currentPage" @input="saveSettings" :total-rows="filteredSortedItems.length" :per-page="settings.pageSize" style="height: 0;"></b-pagination>
          </div>
          <div class="mt-0 pl-1">
            <b-form-select size="sm" v-model="settings.pageSize" @change="saveSettings" :options="pageSizes" v-b-popover.hover.ds500="'Page size'"></b-form-select>
          </div>
        </div>

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
        tokenAgentAddress: null,
        tokenAgentOwner: null,
        addOffers: {
          offers: [],
          token: null,
          type: null,
          buySell: 0,
          count: null,
          pricing: 0,
          expiry: null,
          prices: [],
          tokenIds: [],
          tokenss: [],
        },
        filter: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'ownertokenagentasc',
        version: 3,
      },
      buySellOptions: [
        { value: 0, text: 'BUY' },
        { value: 1, text: 'SELL' },
      ],
      pricingOptions: [
        { value: 0, text: 'SINGLE' },
        { value: 1, text: 'MULTIPLE' },
      ],
      sortOptions: [
        { value: 'ownertokenagentasc', text: '▲ Owner, ▲ Token Agent' },
        { value: 'ownertokenagentdsc', text: '▼ Owner, ▲ Token Agent' },
        { value: 'tokenagentasc', text: '▲ Token Agent' },
        { value: 'tokenagentdsc', text: '▼ Token Agent' },
        // TODO: Deploy new TokenContractFactory with index worked out
        // { value: 'indexasc', text: '▲ Index' },
        // { value: 'indexdsc', text: '▼ Index' },
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
      // console.log(now() + " INFO Agent:computed.tokenAgentsDropdownOptions - results[0..9]: " + JSON.stringify(this.filteredSortedItems.slice(0, 10), null, 2));
      return results;
    },

    tokenContractsDropdownOptions() {
      const results = (store.getters['data/forceRefresh'] % 2) == 0 ? [] : [];
      for (const [tokenContract, d] of Object.entries(this.tokenContracts[this.chainId] || {})) {
        if (d.transfers) {
          results.push({ tokenContract, type: d.type, symbol: d.symbol, name: d.name });
        }
      }
      // console.log(now() + " INFO Agent:computed.tokenAgentsDropdownOptions - results[0..9]: " + JSON.stringify(this.filteredSortedItems.slice(0, 10), null, 2));
      return results;
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
      // console.log(now() + " INFO Agent:computed.pagedFilteredSortedItems - results[0..1]: " + JSON.stringify(this.filteredSortedItems.slice(0, 2), null, 2));
      return this.filteredSortedItems.slice((this.settings.currentPage - 1) * this.settings.pageSize, this.settings.currentPage * this.settings.pageSize);
    },

  },
  methods: {
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
    async loadData() {
      console.log(now() + " INFO Agent:methods.loadData - tokenAgentAgentSettings: " + JSON.stringify(this.settings, null, 2));
      // store.dispatch('syncOptions/loadData');
    },
    saveSettings() {
      console.log(now() + " INFO Agent:methods.saveSettings - tokenAgentAgentSettings: " + JSON.stringify(this.settings, null, 2));
      localStorage.tokenAgentAgentSettings = JSON.stringify(this.settings);
    },
    async viewSyncOptions() {
      store.dispatch('syncOptions/viewSyncOptions');
    },
    async halt() {
      store.dispatch('data/setSyncHalt', true);
    },
    newTransfer(stealthMetaAddress = null) {
      console.log(now() + " INFO Agent:methods.newTransfer - stealthMetaAddress: " + stealthMetaAddress);
      store.dispatch('newTransfer/newTransfer', stealthMetaAddress);
    },
    async timeoutCallback() {
      // console.log(now() + " DEBUG Agent:methods.timeoutCallback - count: " + this.count);
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
    // console.log(now() + " DEBUG Agent:beforeDestroy");
  },
  mounted() {
    // console.log(now() + " DEBUG Agent:mounted - $route: " + JSON.stringify(this.$route.params));
    store.dispatch('data/restoreState');
    if ('tokenAgentAgentSettings' in localStorage) {
      const tempSettings = JSON.parse(localStorage.tokenAgentAgentSettings);
      if ('version' in tempSettings && tempSettings.version == this.settings.version) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
      // this.loadData(this.settings.tokenAgentAddress);
    }
    this.reschedule = true;
    // console.log(now() + " DEBUG Agent:mounted - calling timeoutCallback()");
    this.timeoutCallback();
  },
  destroyed() {
    this.reschedule = false;
  },
};

const agentModule = {
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
