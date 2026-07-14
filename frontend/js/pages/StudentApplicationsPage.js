window.StudentApplicationsPage = {
  template: `<section class="card-glow panel p-4"><h2 class="section-title mb-3">My Application History</h2>
  <div class="table-responsive"><table class="table table-dark-custom align-middle"><thead><tr><th>Job Title</th><th>Status / Interview Info</th><th>Applied Date</th></tr></thead><tbody>
  <tr v-for="a in applications" :key="a.job_title + a.application_date">
    <td>{{ a.job_title }}</td>
    <td>
      <span class="badge" :class="statusClass(a.status)">{{ a.status }}</span>
      <div v-if="a.interview_date" class="mt-2 small text-warning bg-black p-2 rounded border border-secondary" style="max-width: 300px;">
        <strong>Interview Scheduled</strong><br>
        Time: {{ a.interview_date }}<br>
        Details: {{ a.interview_details || '-' }}
      </div>
    </td>
    <td>{{ a.application_date }}</td>
  </tr>
  </tbody></table></div><button class="btn btn-outline-info" @click="exportCsv">Export CSV (Async Job)</button></section>`,
  setup(_, { emit }) {
    const applications = Vue.ref([]);

    async function exportCsv() {
      try {
        const res = await window.api.get('/student/export_csv');
        emit('flash', 'Export started... generating CSV file.');
        
        if (res.task_id) {
          const interval = setInterval(async () => {
            try {
              const statusRes = await window.api.get('/student/task_status/' + res.task_id);
              if (statusRes.ready) {
                clearInterval(interval);
                emit('flash', 'CSV Export complete! File generated successfully.');
              }
            } catch (_) {
              clearInterval(interval);
            }
          }, 2000);
        }
      } catch (e) {
        emit('error', e.message);
      }
    }

    Vue.onMounted(async () => {
      try {
        applications.value = await window.api.get('/student/applications');
      } catch (e) {
        emit('error', e.message);
      }
    });

    function statusClass(status) {
      const s = (status || '').toLowerCase();
      if (s === 'selected') return 'bg-success';
      if (s === 'rejected') return 'bg-danger';
      if (s === 'shortlisted') return 'bg-warning text-dark';
      return 'bg-secondary';
    }

    return { applications, exportCsv, statusClass };
  }
};
