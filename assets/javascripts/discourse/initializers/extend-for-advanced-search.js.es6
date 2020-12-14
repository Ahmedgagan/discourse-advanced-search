import { withPluginApi } from "discourse/lib/plugin-api";
import SearchAdvancedOptions from "discourse/components/search-advanced-options";

function initialize(api) {
  api.modifyClass("component:tag-group-chooser", {
    actions: {
      onChange(value) {
        this._super(...arguments);
        if (this.onChangeSearchedTermField && this.enable_option_exclude_tag_group) {
          this.onChangeSearchedTermField(
            "excludeTagGroup",
            "_updateSearchTermForExcludeTagGroup",
            value
          );
        }
      },
    },
  });
}

const REGEXP_TAG_GROUP_PREFIX = /^(excludeTagGroup:)/gi;
const REGEXP_USERNAME_PREFIX = /^(topic_created_by:)/gi;

export default {
  name: "extend-for-advanced-search-options",
  initialize(container) {
    const siteSettings = container.lookup("site-settings:main");
    if (!siteSettings.tag_group_action_enabled) {
      return;
    }
    const currentUser = container.lookup("current-user:main");

    if (currentUser) {
      SearchAdvancedOptions.reopen({
        init() {
          this._super();

          this.set("searchedTerms.excludeTagGroup", null);
          this.set("searchedTerms.topic_created_by", null);
        },

        _updateSearchTermForExcludeTagGroup() {
          const match = this.filterBlocks(REGEXP_TAG_GROUP_PREFIX);
          let userFilter = this.get("searchedTerms.excludeTagGroup");
          let searchTerm = this.searchTerm || "";
          let keyword = "excludeTagGroup";
          if (userFilter && userFilter.length !== 0) {
            userFilter = userFilter[0].replaceAll(" ", "_");
            if (match.length !== 0) {
              searchTerm = searchTerm.replace(
                match[0],
                `${keyword}:${userFilter}`
              );
            } else {
              searchTerm += ` ${keyword}:${userFilter}`;
            }
            this._updateSearchTerm(searchTerm);
          } else if (match.length !== 0) {
            searchTerm = searchTerm.replace(match[0], "");
            this._updateSearchTerm(searchTerm);
          }
        },

        _updateSearchTermForTopicCreatedBy() {
          const match = this.filterBlocks(REGEXP_USERNAME_PREFIX);
          const userFilter = this.get("searchedTerms.topic_created_by");
          let searchTerm = this.searchTerm || "";
          let keyword = "topic_created_by";
          if (userFilter && userFilter.length !== 0) {
            if (match.length !== 0) {
              searchTerm = searchTerm.replace(
                match[0],
                `${keyword}:${userFilter}`
              );
            } else {
              searchTerm += ` ${keyword}:${userFilter}`;
            }

            this._updateSearchTerm(searchTerm.trim());
          } else if (match.length !== 0) {
            searchTerm = searchTerm.replace(match[0], "");
            this._updateSearchTerm(searchTerm.trim());
          }
        },

        didReceiveAttrs() {
          this._super(...arguments);
          this.setSearchedTermValue(
            "searchedTerms.excludeTagGroup",
            REGEXP_TAG_GROUP_PREFIX
          );
          this.setSearchedTermValue(
            "searchedTerms.topic_created_by",
            REGEXP_USERNAME_PREFIX
          );
        },
      });
    }

    withPluginApi("0.11.0", (api) => initialize(api, container));
  },
};
