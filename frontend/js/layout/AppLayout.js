window.AppLayout = {
  template: `
  <div class="page-wrap">
    <nav class="navbar top-nav sticky-top">
      <div class="container-fluid px-2 py-1 flex-wrap flex-md-nowrap gap-2">
        <span class="brand">SmartPlacement</span>
        
        <!-- Role-based center tabs -->
        <div v-if="isLoggedIn" class="d-flex flex-wrap gap-1 gap-md-2 mx-md-auto justify-content-center order-3 order-md-2 w-100 w-md-auto mt-2 mt-md-0">
          <template v-if="role === 'administrator'">
            <router-link class="nav-tab" to="/admin">Dashboard</router-link>
            <router-link class="nav-tab" to="/admin/companies">Companies</router-link>
            <router-link class="nav-tab" to="/admin/drives">Drives</router-link>
            <router-link class="nav-tab" to="/admin/students">Students</router-link>
            <router-link class="nav-tab" to="/admin/applications">Applications</router-link>
            <router-link class="nav-tab" to="/admin/search">Search</router-link>
          </template>
          
          <template v-if="role === 'company'">
            <router-link class="nav-tab" to="/company">Dashboard</router-link>
            <router-link class="nav-tab" to="/company/create-drive">Create Drive</router-link>
            <router-link class="nav-tab" to="/company/drives">My Drives</router-link>
            <router-link class="nav-tab" to="/company/applications">Applicants</router-link>
          </template>

          <template v-if="role === 'student'">
            <router-link class="nav-tab" to="/student">Dashboard</router-link>
            <router-link class="nav-tab" to="/student/profile">Profile</router-link>
            <router-link class="nav-tab" to="/student/drives">Search Drives</router-link>
            <router-link class="nav-tab" to="/student/applications">History</router-link>
          </template>
        </div>

        <div class="d-flex gap-2 align-items-center order-2 order-md-3 ms-auto ms-md-0">
          <button v-if="isLoggedIn" @click="logout" class="btn btn-danger btn-sm">Logout</button>
        </div>
      </div>
    </nav>
    <main class="container-fluid px-lg-5 py-4">
      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <router-view @flash="flash" @error="setError" />
    </main>
    <div class="position-fixed bottom-0 end-0 p-3" style="z-index:1090">
      <div class="toast text-bg-dark border-0" ref="toastRef">
        <div class="d-flex">
          <div class="toast-body">{{ message }}</div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    </div>
  </div>`,
  setup() {
    const message = Vue.ref('');
    const error = Vue.ref('');
    const toastRef = Vue.ref(null);
    let toast;

    Vue.onMounted(async () => {
      toast = new bootstrap.Toast(toastRef.value, { delay: 2500 });
      if (!window.sessionStore.loaded) {
        try { await window.sessionStore.refresh(); } catch (_) { window.sessionStore.loaded = true; }
      }
    });

    const isLoggedIn = Vue.computed(() => Boolean(window.sessionStore.role));
    const role = Vue.computed(() => window.sessionStore.role);
    const roleHome = Vue.computed(() => window.roleHomeMap[window.sessionStore.role] || '/');

    async function logout() { await window.sessionStore.logout(); location.assign('/'); }
    function flash(msg) { message.value = msg; error.value = ''; toast?.show(); }
    function setError(msg) { error.value = msg; }

    return { message, error, toastRef, flash, setError, isLoggedIn, role, roleHome, logout };
  },
};
