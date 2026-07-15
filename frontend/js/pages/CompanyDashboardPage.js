window.CompanyDashboardPage = {
  template: `<section class="py-4">
    <div class="text-center mb-5">
      <h1 class="page-title mb-2 d-inline-flex align-items-center justify-content-center gap-2 flex-wrap">
        Company Dashboard
        <span class="badge rounded-pill fs-6 px-3 py-2 border border-light border-opacity-10 shadow-sm" :class="badgeClass">
          {{ company.approval_status || 'Pending' }}
        </span>
      </h1>
      <p class="text-white-50 fs-5">Manage and track recruitment drives</p>
    </div>
    <div class="row g-4 justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-primary border-4 h-100 d-flex flex-column">
          <div class="text-muted small text-uppercase fw-bold mb-2">Company Profile</div>
          <div class="h3 fw-bold text-white mt-2 mb-3">{{ company.company_name || '-' }}</div>
          <div class="text-start mt-auto pt-3 border-top border-secondary border-opacity-25 small">
            <div class="d-flex justify-content-between mb-2 gap-2">
              <span class="text-muted">Username:</span>
              <span class="text-white-50 text-end text-break">{{ company.username || '-' }}</span>
            </div>
            <div class="d-flex justify-content-between mb-2 gap-2">
              <span class="text-muted">Website:</span>
              <span class="text-end text-break">
                <a v-if="company.website" :href="company.website.startsWith('http') ? company.website : 'https://' + company.website" target="_blank" class="text-info text-decoration-none">{{ company.website }}</a>
                <span v-else class="text-white-50">-</span>
              </span>
            </div>
            <div class="d-flex justify-content-between mb-0 gap-2">
              <span class="text-muted">HR Contact:</span>
              <span class="text-white-50 text-end text-break">{{ company.hr_contact || '-' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-warning border-4 h-100 d-flex flex-column justify-content-center">
          <div class="text-muted small text-uppercase fw-bold mb-2">Total Applicants</div>
          <div class="display-4 fw-bold text-warning my-auto py-3">{{ totalApplicants }}</div>
          <div class="small text-muted mt-auto pt-2">Across all recruitment drives</div>
        </div>
      </div>
      <div class="col-md-6 col-lg-4">
        <div class="card-glow panel p-4 text-center border-start border-success border-4 h-100 d-flex flex-column justify-content-center">
          <div class="text-muted small text-uppercase fw-bold mb-2">Recruitment Drives</div>
          <div class="display-4 fw-bold text-success my-auto py-3">{{ drives.length }}</div>
          <div class="small text-muted mt-auto pt-2">Drives registered by company</div>
        </div>
      </div>
    </div>
  </section>`,
  setup(_, { emit }) {
    const company = Vue.reactive({});
    const drives = Vue.ref([]);
    
    Vue.onMounted(async () => {
      try {
        const d = await window.api.get('/company/dashboard');
        Object.assign(company, d.company || {});
        drives.value = d.drives || [];
      } catch (e) {
        emit('error', e.message);
      }
    });

    const totalApplicants = Vue.computed(() => {
      return drives.value.reduce((acc, d) => acc + (d.applicants || 0), 0);
    });

    const badgeClass = Vue.computed(() => {
      const status = (company.approval_status || '').toLowerCase();
      if (status === 'approved') return 'bg-success text-white';
      if (status === 'rejected') return 'bg-danger text-white';
      return 'bg-warning text-dark';
    });

    return { company, drives, totalApplicants, badgeClass };
  }
};
