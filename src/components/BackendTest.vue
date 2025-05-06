<template>
  <div class="container">
    <h1>Backend Test</h1>
    <p>This is a test component to check backend functionality.</p>
    <button>Test Backend</button>
    <div v-if="response">
      <h2>Response:</h2>
      <pre>{{ response }}</pre>
    </div>
  </div>
</template>

<script>

</script>
