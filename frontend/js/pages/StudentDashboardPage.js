window.StudentDashboardPage = {
  template: `
<section class="py-4">
  <div class="text-center mb-5">
    <h1 class="page-title mb-2">Student Dashboard</h1>
    <p class="text-white-50 fs-5">Monitor your application status and drives</p>
  </div>
  <div class="row g-4 justify-content-center">
    <div class="col-md-6 col-lg-3">
      <div class="card-glow panel p-4 text-center border-start border-info border-4">
        <div class="text-muted small text-uppercase fw-bold mb-2">Active Drives</div>
        <div class="display-4 fw-bold text-white">{{ drivesCount }}</div>
        <div class="small text-muted mt-1">Drives open for applications</div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="card-glow panel p-4 text-center border-start border-primary border-4">
        <div class="text-muted small text-uppercase fw-bold mb-2">My Applications</div>
        <div class="display-4 fw-bold text-white">{{ appliedCount }}</div>
        <div class="small text-muted mt-1">Drives you have applied to</div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="card-glow panel p-4 text-center border-start border-warning border-4">
        <div class="text-muted small text-uppercase fw-bold mb-2">Shortlisted</div>
        <div class="display-4 fw-bold text-white">{{ shortlistedCount }}</div>
        <div class="small text-muted mt-1">Pending interview rounds</div>
      </div>
    </div>
    <div class="col-md-6 col-lg-3">
      <div class="card-glow panel p-4 text-center border-start border-success border-4">
        <div class="text-muted small text-uppercase fw-bold mb-2">Selected Offers</div>
        <div class="display-4 fw-bold text-white">{{ selectedCount }}</div>
        <div class="small text-muted mt-1">Active placement offers</div>
      </div>
    </div>
  </div>
</section>
  `,
  setup(_, { emit }) {
    const drivesCount = Vue.ref(0);
    const appliedCount = Vue.ref(0);
    const shortlistedCount = Vue.ref(0);
    const selectedCount = Vue.ref(0);

    Vue.onMounted(async () => {
      try {
        const d = await window.api.get('/student/dashboard');
        drivesCount.value = (d.drives || []).length;
        
        const apps = d.applications || [];
        appliedCount.value = apps.length;
        shortlistedCount.value = apps.filter(a => (a.status || '').toLowerCase() === 'shortlisted').length;
        selectedCount.value = apps.filter(a => (a.status || '').toLowerCase() === 'selected').length;
      } catch (e) {
        emit('error', e.message);
      }
    });

    return {
      drivesCount,
      appliedCount,
      shortlistedCount,
      selectedCount
    };
  }
};
