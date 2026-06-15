<%= ENV['PR_TITLE'] %>

## 確認事項
- [ ] staging での動作チェック

## 更新内容
<% pull_requests.each do |pr| -%>
<%= pr.to_checklist_item %>
<% end -%>
