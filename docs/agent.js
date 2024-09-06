const Agent = {
  template: `
    <div class="m-0 p-0">
      <b-card no-body no-header class="border-0">
        <div class="d-flex flex-wrap m-0 p-0">
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

        <b-table ref="theTable" small fixed striped responsive hover :fields="fields" :items="pagedFilteredSortedItems" show-empty head-variant="light" class="m-0 mt-1">
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
        filter: null,
        currentPage: 1,
        pageSize: 10,
        sortOption: 'ownertokenagentasc',
        version: 1,
      },
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
      if ('version' in tempSettings && tempSettings.version == 0) {
        this.settings = tempSettings;
        this.settings.currentPage = 1;
      }
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
