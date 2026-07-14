window.StudentProfilePage = {
  template: `
<section class="card-glow panel p-4">

  <h2 class="section-title mb-4">Student Profile</h2>

  <form @submit.prevent="saveProfile">

    <div class="row g-3">

      <div class="col-md-6">
        <label class="form-label">Name</label>
        <input
          v-model="profile.full_name"
          class="form-control"
          placeholder="Enter your name">
      </div>

      <div class="col-md-6">
        <label class="form-label">Email</label>
        <input
          type="email"
          v-model="profile.username"
          class="form-control"
          readonly>
      </div>

      <div class="col-md-6">
        <label class="form-label">Branch</label>
        <input
          v-model="profile.branch"
          class="form-control"
          placeholder="Enter branch">
      </div>

      <div class="col-md-6">
        <label class="form-label">CGPA</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="10"
          v-model="profile.cgpa"
          class="form-control"
          placeholder="Enter CGPA">
      </div>

      <div class="col-md-6">
        <label class="form-label">Graduation Year</label>
        <input
          type="number"
          v-model="profile.graduation_year"
          class="form-control"
          placeholder="Enter graduation year">
      </div>

      <div class="col-12 d-grid mt-3">
        <button class="btn btn-success btn-lg">
          Save Changes
        </button>
      </div>

    </div>

  </form>

  <hr class="my-5">

  <h4 class="mb-3">Resume</h4>

  <form @submit.prevent="upload" class="row g-2">

    <div class="col-md-8">
      <input
        ref="resume"
        type="file"
        class="form-control"
        accept=".pdf,.doc,.docx">
    </div>

    <div class="col-md-4 d-grid">
      <button class="btn btn-primary">
        Upload Resume
      </button>
    </div>

    <div class="col-12 mt-3" v-if="resumeFilename">
      <p class="mb-1">Uploaded resume:</p>
      <a :href="resumeLink" target="_blank" class="btn btn-outline-light btn-sm">
        Open {{ resumeFilename }}
      </a>
    </div>

  </form>

</section>
`,

  setup(_, { emit }) {

    const profile = Vue.reactive({
      username: "",
      full_name: "",
      branch: "",
      cgpa: "",
      graduation_year: "",
      resume_path: null
    });

    const resume = Vue.ref(null);

    async function loadProfile() {
      try {
        const data = await window.api.get("/student/profile");
        Object.assign(profile, data);
      } catch (e) {
        emit("error", e.message);
      }
    }

    async function saveProfile() {
      try {
        await window.api.put("/student/profile", {
          full_name: profile.full_name,
          branch: profile.branch,
          cgpa: profile.cgpa,
          graduation_year: profile.graduation_year
        });
        emit("flash", "Profile updated successfully");
      } catch (e) {
        emit("error", e.message);
      }
    }

    async function upload() {
      try {
        const file = resume.value?.files?.[0];

        if (!file) {
          emit("error", "Please select a resume.");
          return;
        }

        const fd = new FormData();
        fd.append("resume", file);

        await window.api.post("/student/upload_resume", fd);

        emit("flash", "Resume uploaded successfully.");

        resume.value.value = "";
        await loadProfile();

      } catch (e) {
        emit("error", e.message);
      }
    }

    const resumeFilename = Vue.computed(() => {
      if (!profile.resume_path) return null;
      const parts = profile.resume_path.split(/[\/]/);
      return parts[parts.length - 1];
    });

    const resumeLink = Vue.computed(() => resumeFilename.value ? `/uploads/${encodeURIComponent(resumeFilename.value)}` : "#");

    Vue.onMounted(loadProfile);

    return {
      profile,
      resume,
      saveProfile,
      upload,
      resumeFilename,
      resumeLink
    };
  }
};