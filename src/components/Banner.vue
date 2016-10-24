<template>
  <div>
    <h1>This is the banner</h1>
  </div>
</template>

<script>
export default {
  name: 'banner'
}
</script>

<style scoped>
h1 {
  font-weight: normal;
}
</style>

<!--
<div id="header">
  <!- -<% if (!"off".equals(request.getParameter("header"))) { %>
    ${config.header}
  <% } %>- ->
  <div id="toolbar">
    <!- -<c:forEach items="${config.languages}" var="lang">
      <a href="?lang=${lang.key}" class="blue_button lang_button <c:if test="${lang.key == pageContext.response.locale}">selected</c:if>" id="button_${lang.key}">${lang.value}</a>
    </c:forEach>
    <% if (!"off".equals(request.getParameter("feedback"))) { %>
      <a href="#" class="blue_button" id="button_feedback"><spring:message code="feedback" /></a>
    <% } %>
    <% if (!"off".equals(request.getParameter("statistics"))) { %>
      <a href="#" class="blue_button" id="button_statistics"><spring:message code="statistics" /></a>
    <% } %>- ->
    <div id="time_slider_pane">
      <div id="time_slider"></div>
      <div id="time_slider_label"></div>
    </div>
  </div>
</div>
-->
