export default {
  shouldRender(args, component) {
    return component.currentUser;
  },

  setupComponent(args, component) {
    component.set("enable_option_exclude_tag_group",component.siteSettings.enable_option_exclude_tag_group);
    component.set("enable_option_topic_created_by",component.siteSettings.enable_option_topic_created_by);
  },

  actions: {
    onChange(value) {
      if (this.onChangeSearchedTermField) {
        this.onChangeSearchedTermField(
          "topic_created_by",
          "_updateSearchTermForTopicCreatedBy",
          value
        );
      } else {
        this.set("searchedTerms.topic_created_by", value);
      }
    },
  },
};
