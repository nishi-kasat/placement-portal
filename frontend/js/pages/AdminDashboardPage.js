window.AdminDashboardPage = {
  template: `
  <section class="py-4">
    <div class="text-center mb-5">
      <h1 class="page-title mb-2">Admin Dashboard</h1>
    </div>
    <div class="row g-4 justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-primary border-4">
          <div class="text-muted small text-uppercase fw-bold mb-2">Students</div>
          <div class="display-4 fw-bold text-white">{{ stats.total_students }}</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-success border-4">
          <div class="text-muted small text-uppercase fw-bold mb-2">Companies</div>
          <div class="display-4 fw-bold text-white">{{ stats.total_companies }}</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-info border-4">
          <div class="text-muted small text-uppercase fw-bold mb-2">Drives</div>
          <div class="display-4 fw-bold text-white">{{ stats.total_drives }}</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-warning border-4">
          <div class="text-muted small text-uppercase fw-bold mb-2">Total Applications</div>
          <div class="display-4 fw-bold text-white">{{ stats.total_applications }}</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-danger border-4">
          <div class="text-muted small text-uppercase fw-bold mb-2">Placed Students</div>
          <div class="display-4 fw-bold text-white">{{ stats.total_selected }}</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-light border-4">
          <div class="text-muted small text-uppercase fw-bold mb-2">Placement Rate</div>
          <div class="display-4 fw-bold text-white">{{ stats.placement_rate }}%</div>
        </div>
      </div>
    </div>
  </section>`,
  setup(_, { emit }) {
    const stats = Vue.reactive({
      total_students: 0,
      total_companies: 0,
      total_drives: 0,
      total_applications: 0,
      total_selected: 0,
      placement_rate: 0
    });
    Vue.onMounted(async () => {
      try {
        Object.assign(stats, await window.api.get('/admin/dashboard'));
      } catch (e) {
        emit('error', e.message);
      }
    });
    return { stats };
  }
};
