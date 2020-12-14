# frozen_string_literal: true

# name: Discourse Tag Group Actions
# about: adds new bulk-action and search-advance option
# version: 0.1
# authors: Ahmed Gagan
# url: https://github.com/Ahmedgagan/discourse-tag-group-actions

enabled_site_setting :tag_group_action_enabled

after_initialize do
  register_search_advanced_filter(/excludeTagGroup:(.+)$/) do |posts, match|
    if SiteSetting.tagging_enabled
      matchNew = match.gsub("_", " ")

      if tag_group = TagGroup.find_by_name(matchNew)
        posts.where("topics.id NOT IN (
          SELECT DISTINCT tt.topic_id
          FROM topic_tags tt
          INNER JOIN tag_group_memberships tgm
          ON tt.tag_id=tgm.tag_id
          WHERE tgm.tag_group_id=#{tag_group.id}
          OR tt.tag_id=#{tag_group.parent_tag_id || "null"}
        )")
      end
    end
  end

  register_search_advanced_filter(/topic_created_by:(.+)$/) do |posts, match|
    if user_id = User.find_by_username(match)&.id
      posts.where("topics.id IN (
        SELECT topics.id
        FROM topics
        WHERE tc.user_id = #{user_id}
        )")
    end
  end
end
