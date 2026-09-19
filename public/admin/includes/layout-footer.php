            </div><!-- /col-md-9 col-lg-10 -->
          </div><!-- /row -->
          
        </div><!-- /container-xl -->
      </div><!-- /page-body -->
      
      <!-- Footer -->
      <footer class="footer footer-transparent d-print-none">
        <div class="container-xl">
          <div class="row text-center align-items-center">
            <div class="col-12">
              <ul class="list-inline list-inline-dots mb-0">
                <li class="list-inline-item">&copy; <?= date('Y') ?> <a href="<?= SITE_URL ?>" target="_blank">ADWire Agency</a></li>
                <li class="list-inline-item">Admin Panel v1.0</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div><!-- /page-wrapper -->
  </div><!-- /page -->

  <!-- Tabler JS -->
  <script src="/admin/assets/js/tabler.min.js"></script>
  
  <!-- CSRF 自動注入：為所有表單加入 CSRF Token，並為 fetch 請求加入 Header -->
  <script>
  (function() {
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
    if (!csrfToken) return;

    // 1. 為頁面上所有 <form> 自動注入隱藏 CSRF 欄位
    document.querySelectorAll('form[method="POST"], form[method="post"]').forEach(form => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'csrf_token';
        input.value = csrfToken;
        form.prepend(input);
      }
    });

    // 2. 攔截 fetch 請求，自動加入 X-CSRF-Token Header
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      if (options.method && options.method.toUpperCase() === 'POST') {
        options.headers = options.headers || {};
        if (!options.headers['X-CSRF-Token']) {
          options.headers['X-CSRF-Token'] = csrfToken;
        }
      }
      return originalFetch.call(this, url, options);
    };
  })();
  </script>

  <!-- 重建觸發 -->
  <script>
  function triggerRebuild() {
    if (!confirm('確定要觸發網站重建嗎？大約需要 2-3 分鐘。')) return;
    
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader me-1"></i>重建中...';
    
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
    fetch('<?= ADMIN_URL ?>/api/rebuild.php', {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken }
    })
      .then(r => r.json())
      .then(data => {
        alert(data.message);
        btn.innerHTML = originalText;
        btn.disabled = false;
      })
      .catch(err => {
        alert('觸發失敗，請稍後再試。');
        btn.innerHTML = originalText;
        btn.disabled = false;
      });
  }
  </script>
</body>
</html>
