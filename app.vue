<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
    <header class="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white shadow-2xl border-b-4 border-purple-700">
      <div class="container mx-auto px-4 py-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
              <span class="text-5xl">📦</span>
            </div>
            <div>
              <h1 class="text-4xl font-bold tracking-tight">Stock Idol</h1>
              <p class="text-purple-100 mt-1 text-sm font-medium">ระบบจัดการสินค้าศิลปิน</p>
            </div>
          </div>
          <div class="hidden md:flex items-center space-x-3 bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-sm">
            <span class="text-2xl">✨</span>
            <span class="font-semibold text-lg">จัดการสต๊อกได้ง่าย รวดเร็ว</span>
          </div>
        </div>
      </div>
    </header>
    
    <main class="container mx-auto px-4 py-10">
      <NuxtPage />
    </main>
    
    <footer class="mt-12 py-6 text-center text-gray-600 border-t border-gray-200">
      <p class="font-medium">Made with <span class="text-red-500 text-xl">❤️</span> for Idol Fans</p>
    </footer>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
