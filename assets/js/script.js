document.addEventListener("DOMContentLoaded", () => {
  setupDesktopDropdowns();
  setupMobileMenu();
  setupTabs();
  setupSlider();
  PaginationSystem.initAdaptive();
});

/* ========== DESKTOP DROPDOWN ========== */
function setupDesktopDropdowns() {
  document
    .querySelectorAll(".nav-menu > li.has-dropdown")
    .forEach((dropdown) => {
      dropdown.addEventListener("mouseenter", () => {
        const menu = dropdown.querySelector(".dropdown-menu");
        if (menu) {
          menu.style.opacity = "1";
          menu.style.visibility = "visible";
        }
      });
      dropdown.addEventListener("mouseleave", () => {
        const menu = dropdown.querySelector(".dropdown-menu");
        if (menu) {
          menu.style.opacity = "0";
          menu.style.visibility = "hidden";
          menu.querySelectorAll(".nested-dropdown-menu").forEach((nested) => {
            nested.style.opacity = "0";
            nested.style.visibility = "hidden";
          });
        }
      });
    });

  document.querySelectorAll(".nested-dropdown").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const nested = item.querySelector(".nested-dropdown-menu");
      if (nested) {
        nested.style.opacity = "1";
        nested.style.visibility = "visible";
      }
    });
    item.addEventListener("mouseleave", () => {
      const nested = item.querySelector(".nested-dropdown-menu");
      if (nested) {
        nested.style.opacity = "0";
        nested.style.visibility = "hidden";
      }
    });
  });
}

/* ========== MOBILE MENU ========== */
function setupMobileMenu() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeMenu = document.getElementById("closeMenu");

  if (!hamburger || !mobileMenu) return;

  const toggleMenu = (show) => {
    hamburger.classList.toggle("active", show);
    mobileMenu.classList.toggle("active", show);
    document.body.style.overflow = show ? "hidden" : "";
  };

  hamburger.addEventListener("click", () =>
    toggleMenu(!hamburger.classList.contains("active"))
  );
  closeMenu?.addEventListener("click", () => toggleMenu(false));

  document.querySelector(".mobile-menu")?.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    const dropdown = link?.nextElementSibling;
    if (dropdown?.classList.contains("dropdown")) {
      e.preventDefault();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
      const icon = link.querySelector("i");
      if (icon) {
        icon.classList.toggle("ri-arrow-down-s-line");
        icon.classList.toggle("ri-arrow-up-s-line");
      }
    }
  });

  document
    .querySelectorAll('.mobile-menu a:not([href="#"])')
    .forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });
}

/* ========== TAB SİSTEMİ ========== */
function setupTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const cards = document.querySelectorAll(".card");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const filter = tab.dataset.tab;

      cards.forEach((card) => {
        if (filter === "all" || card.dataset.category === filter) {
          card.style.display = "block";
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, 10);
        } else {
          card.style.opacity = "0";
          card.style.transform = "translateY(20px)";
          setTimeout(() => {
            card.style.display = "none";
          }, 300);
        }
      });

      setTimeout(() => PaginationSystem.initAdaptive(), 50);
    });
  });
}

/* ========== SLIDER ========== */
function setupSlider() {
  const slider = document.querySelector(".slider");
  if (!slider) return;

  let isDown = false,
    startX = 0,
    scrollLeft = 0;

  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.classList.add("active");
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  ["mouseleave", "mouseup"].forEach((event) =>
    slider.addEventListener(event, () => {
      isDown = false;
      slider.classList.remove("active");
    })
  );
  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2;
    slider.scrollLeft = scrollLeft - walk;
  });
}

/* ========== GENEL PAGES/PAGINATION SYSTEM ========== */
const PaginationSystem = (() => {
  const defaultConfig = {
    cardsPerPage: 6,
    activePageClass: "active",
    pageNumberSelector: ".page-number",
    pageArrowSelector: ".page-arrow",
    cardsContainerSelector: ".cards-container",
    cardSelector: ".card",
    rowsSelector: null,
  };

  let currentPage = 1,
    totalPages = 1,
    visibleCards = [];
  let paginationContainer, cardsContainer, cards;

  const init = (customConfig = {}) => {
    const cfg = { ...defaultConfig, ...customConfig };
    paginationContainer = document.querySelector(".pagination");
    cardsContainer = document.querySelector(cfg.cardsContainerSelector);
    cards = Array.from(document.querySelectorAll(cfg.cardSelector));

    totalPages = Math.ceil(cards.length / cfg.cardsPerPage);

    if (!paginationContainer || !cards.length) return;

    paginationContainer.addEventListener("click", (e) => {
      const pageNumber = e.target.closest(cfg.pageNumberSelector);
      const pageArrow = e.target.closest(cfg.pageArrowSelector);

      if (pageNumber) {
        e.preventDefault();
        const page = parseInt(pageNumber.textContent);
        if (page !== currentPage) renderPage(page, cfg);
      } else if (pageArrow) {
        e.preventDefault();
        if (
          pageArrow.querySelector(".ri-arrow-right-s-line") &&
          currentPage < totalPages
        ) {
          renderPage(currentPage + 1, cfg);
        } else if (
          pageArrow.querySelector(".ri-arrow-left-s-line") &&
          currentPage > 1
        ) {
          renderPage(currentPage - 1, cfg);
        }
      }
    });

    renderPage(1, cfg);
  };

  const renderPage = (page, cfg) => {
    currentPage = page;
    const startIndex = (currentPage - 1) * cfg.cardsPerPage;
    const endIndex = startIndex + cfg.cardsPerPage;

    cards.forEach((card, i) => {
      card.style.display =
        i >= startIndex && i < endIndex
          ? cfg.rowsSelector
            ? "flex"
            : "block"
          : "none";
    });

    updatePaginationUI(cfg);
    scrollToTop();
  };

  const updatePaginationUI = (cfg) => {
    const pageNumbers = paginationContainer.querySelectorAll(
      cfg.pageNumberSelector
    );
    pageNumbers.forEach((btn) => {
      btn.classList.toggle(
        cfg.activePageClass,
        parseInt(btn.textContent) === currentPage
      );
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const initAdaptive = () => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (document.querySelector(".yazi-card-container")) {
      init({
        cardsPerPage: isMobile ? 3 : 6,
        cardsContainerSelector: ".yazi-card-container",
        cardSelector: ".yazi-colon",
        rowsSelector: ".yazi-card-row",
      });
    } else if (document.querySelector(".cards-container")) {
      init({
        cardsPerPage: isMobile ? 6 : 9,
        cardsContainerSelector: ".cards-row",
        cardSelector: ".card",
      });
    }
  };

  return { init, initAdaptive };
})();

//YÖNLENDİRME
document.querySelector(".sol-box").addEventListener("click", function () {
  window.location.href = "dai.html";
});

document
  .querySelector(".alt")
  .addEventListener("click", function () {
    window.location.href = "dai.html";
  });

//uzman slider
function setupSlider() {
  const slider = document.getElementById("slider");

  let isDragging = false;
  let startX = 0;
  let previousTranslate = 0;

  const getX = (event) =>
    event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;

  slider.addEventListener("mousedown", dragStart);
  slider.addEventListener("touchstart", dragStart);

  slider.addEventListener("mouseup", dragEnd);
  slider.addEventListener("mouseleave", dragEnd);
  slider.addEventListener("touchend", dragEnd);

  slider.addEventListener("mousemove", dragMove);
  slider.addEventListener("touchmove", dragMove);

  function dragStart(event) {
    isDragging = true;
    slider.classList.add("dragging");
    startX = getX(event);
    previousTranslate = slider.scrollLeft;
  }

  function dragMove(event) {
    if (!isDragging) return;
    const currentX = getX(event);
    const diff = startX - currentX;
    slider.scrollLeft = previousTranslate + diff;
  }

  function dragEnd() {
    isDragging = false;
    slider.classList.remove("dragging");
  }
}
//mobilde slider
// Mobilde slider fonksiyonelliği
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".gallery-uzman-slider");
  if (!slider) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  // Touch events for mobile
  slider.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("touchend", () => {
    isDown = false;
  });

  slider.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.touches[0].pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });

  // Mouse events for desktop
  slider.addEventListener("mousedown", (e) => {
    isDown = true;
    slider.style.cursor = "grabbing";
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener("mouseleave", () => {
    isDown = false;
    slider.style.cursor = "grab";
  });

  slider.addEventListener("mouseup", () => {
    isDown = false;
    slider.style.cursor = "grab";
  });

  slider.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });
});


document.addEventListener("DOMContentLoaded", function () {
  function initAccordion() {
    // Sadece mobilde çalışsın
    if (window.innerWidth <= 768) {
      const headers = document.querySelectorAll(".grid2-text h1");

      headers.forEach(header => {
        header.addEventListener("click", function () {
          // Eğer aktifse kapat
          if (this.classList.contains("active")) {
            this.classList.remove("active");
          } else {
            // Diğerlerini kapat
            headers.forEach(h => h.classList.remove("active"));
            // Tıklananı aç
            this.classList.add("active");
          }
        });
      });
    }
  }

  initAccordion();

  // Ekran boyutu değişirse yeniden kontrol et
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      initAccordion();
    } else {
      // Masaüstünde her şeyi açık bırak
      const headers = document.querySelectorAll(".grid2-text h1");
      headers.forEach(header => header.classList.remove("active"));
    }
  });
});



document.addEventListener("DOMContentLoaded", function () {
  function initAccordion() {
    const isMobile = window.innerWidth <= 768;
    const headers = document.querySelectorAll(".grid2-text h1");

    headers.forEach(header => {
      const parentLink = header.closest("a");

      // Sayfanın yukarı kaymasını engelle
      if (parentLink) {
        parentLink.addEventListener("click", function (e) {
          e.preventDefault();
        });
      }

      header.addEventListener("click", function () {
        if (!isMobile) return;

        const content = this.parentElement;
        const isActive = this.classList.contains("active");

        // Tümünü kapat
        headers.forEach(h => {
          h.classList.remove("active");
          const pTags = h.parentElement.querySelectorAll("p");
          pTags.forEach(p => p.style.display = "none");
        });

        if (!isActive) {
          this.classList.add("active");
          const pTags = content.querySelectorAll("p");
          pTags.forEach(p => p.style.display = "block");
        }
      });
    });
  }

  initAccordion();

  window.addEventListener("resize", function () {
    const headers = document.querySelectorAll(".grid2-text h1");

    if (window.innerWidth <= 768) {
      initAccordion();
    } else {
      headers.forEach(header => {
        header.classList.remove("active");
        const pTags = header.parentElement.querySelectorAll("p");
        pTags.forEach(p => p.style.display = "block");
      });
    }
  });
});


/* ========== ACCORDION (Tüm sayfalarda) ========== */
function setupAccordion() {
  const headers = document.querySelectorAll(".grid2-text > h1");

  // Hiç header yoksa erken çık
  if (!headers.length) return;

  headers.forEach(header => {
    // <a href="#"> sarmaladıysa, yönlendirmeyi durdur
    const a = header.closest("a");
    if (a) a.addEventListener("click", e => e.preventDefault());

    header.addEventListener("click", () => {
      const isMobile = window.innerWidth <= 768;

      // Masaüstünde accordion kapat/ aç olmasın
      if (!isMobile) return;

      // Aç/kapat işlemi
      const parent = header.parentElement;               // .grid2-text
      const panel  = parent.querySelector(".accordion-content");

      // Önce tümünü kapat
      document.querySelectorAll(".grid2-text").forEach(sec => {
        sec.querySelector("h1").classList.remove("active");
        const p = sec.querySelector(".accordion-content");
        if (p) p.style.maxHeight = null;
      });

      // Kapalıysa aç
      if (panel && !header.classList.contains("active")) {
        header.classList.add("active");
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
}

// Sayfa yüklendiğinde ve her ekran boyutu değiştiğinde çalıştır
document.addEventListener("DOMContentLoaded", setupAccordion);
window.addEventListener("resize", () => {
  // Masaüstüne geçince tüm panelleri açık bırak
  if (window.innerWidth > 768) {
    document.querySelectorAll(".grid2-text").forEach(sec => {
      const h = sec.querySelector("h1");
      const p = sec.querySelector(".accordion-content");
      h.classList.remove("active");
      if (p) p.style.maxHeight = "none";
    });
  }
});

document.addEventListener("DOMContentLoaded", function() {
  // Initialize the accordion
  setupFooterAccordion();
  
  // Re-initialize when window is resized
  window.addEventListener('resize', function() {
    setupFooterAccordion();
  });
});

function setupFooterAccordion() {
  const isMobile = window.innerWidth <= 768;
  const accordionHeaders = document.querySelectorAll('.grid2-text h1');
  
  // Only proceed if we're on mobile or if we need to reset for desktop
  if (!isMobile) {
    // Reset for desktop - make sure all content is visible
    accordionHeaders.forEach(header => {
      header.classList.remove('active');
      const content = header.nextElementSibling;
      if (content) {
        content.style.display = 'block';
      }
    });
    return;
  }
  
  // Mobile accordion functionality
  accordionHeaders.forEach(header => {
    // Prevent default link behavior
    const link = header.closest('a');
    if (link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
      });
    }
    
    // Initialize - hide all content initially
    const content = header.nextElementSibling;
    if (content) {
      content.style.display = 'none';
    }
    
    // Click handler
    header.addEventListener('click', function() {
      const isActive = this.classList.contains('active');
      
      // Close all other accordions
      accordionHeaders.forEach(h => {
        if (h !== this) {
          h.classList.remove('active');
          const otherContent = h.nextElementSibling;
          if (otherContent) {
            otherContent.style.display = 'none';
          }
        }
      });
      
      // Toggle current accordion
      if (isActive) {
        this.classList.remove('active');
        if (content) {
          content.style.display = 'none';
        }
      } else {
        this.classList.add('active');
        if (content) {
          content.style.display = 'block';
        }
      }
    });
  });
}


document.addEventListener("DOMContentLoaded", function() {
  setupFooterAccordion();
  window.addEventListener('resize', setupFooterAccordion);
});

function setupFooterAccordion() {
  const isMobile = window.innerWidth <= 768;
  const accordions = document.querySelectorAll('.grid2-text');

  accordions.forEach(accordion => {
    const header = accordion.querySelector('h1');
    const link = accordion.querySelector('a');
    const content = Array.from(accordion.children).find(el => 
      el.classList.contains('accordion-content') || 
      (el.tagName !== 'H1' && el.tagName !== 'A' && !el.classList.contains('icon-hover-bg'))
    );

    // Create content wrapper if it doesn't exist
    if (!content.classList?.contains('accordion-content')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'accordion-content';
      
      // Move all non-header elements into wrapper
      Array.from(accordion.children).forEach(child => {
        if (child !== header && child !== link) {
          wrapper.appendChild(child);
        }
      });
      
      accordion.appendChild(wrapper);
    }

    // Prevent default link behavior
    if (link) {
      link.addEventListener('click', function(e) {
        if (isMobile) {
          e.preventDefault();
          header.classList.toggle('active');
          const content = header.nextElementSibling;
          if (content) {
            content.style.maxHeight = header.classList.contains('active') 
              ? content.scrollHeight + 'px' 
              : '0';
          }
        }
      });
    }

    // Initialize state
    if (isMobile) {
      const content = header.nextElementSibling;
      if (content && content.classList.contains('accordion-content')) {
        content.style.maxHeight = header.classList.contains('active') 
          ? content.scrollHeight + 'px' 
          : '0';
      }
    } else {
      header.classList.remove('active');
      const content = header.nextElementSibling;
      if (content) {
        content.style.maxHeight = 'none';
      }
    }
  });
}document.addEventListener("DOMContentLoaded", function() {
  setupFooterAccordion();
  window.addEventListener('resize', setupFooterAccordion);
});

function setupFooterAccordion() {
  const isMobile = window.innerWidth <= 768;
  const accordions = document.querySelectorAll('.grid2-text');

  accordions.forEach(accordion => {
    const header = accordion.querySelector('h1');
    const link = header.closest('a');
    const allChildren = Array.from(accordion.children);
    const contentElements = allChildren.filter(child => 
      child !== header && child !== link && !child.classList.contains('icon-hover-bg')
    );

    // Mobile behavior
    if (isMobile) {
      // Hide all content initially
      contentElements.forEach(el => el.style.display = 'none');
      
      // Click handler
      const clickHandler = (e) => {
        e.preventDefault();
        const wasActive = header.classList.contains('active');
        
        // Close all others
        document.querySelectorAll('.grid2-text h1').forEach(h => {
          if (h !== header) {
            h.classList.remove('active');
            const siblings = Array.from(h.parentElement.children).filter(
              sib => sib !== h && sib !== h.closest('a')
            );
            siblings.forEach(sib => sib.style.display = 'none');
          }
        });
        
        // Toggle current
        header.classList.toggle('active');
        contentElements.forEach(el => {
          el.style.display = header.classList.contains('active') ? 'block' : 'none';
        });
      };
      
      if (link) {
        link.addEventListener('click', clickHandler);
      } else {
        header.addEventListener('click', clickHandler);
      }
    } 
    // Desktop behavior
    else {
      header.classList.remove('active');
      contentElements.forEach(el => el.style.display = 'block');
      
      // Remove mobile event listeners
      if (link) {
        link.replaceWith(link.cloneNode(true));
      } else {
        header.replaceWith(header.cloneNode(true));
      }
    }
  });
}

// Mobil menü accordion fonksiyonu
document.addEventListener('DOMContentLoaded', function() {
  // Mobil menü toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeMenu = document.getElementById('closeMenu');

  hamburger.addEventListener('click', function() {
    mobileMenu.classList.add('active');
  });

  closeMenu.addEventListener('click', function() {
    mobileMenu.classList.remove('active');
  });

  // Accordion fonksiyonu
  const accordionToggles = document.querySelectorAll('#tedaviToggle');
  
  accordionToggles.forEach(toggle => {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      const parentItem = this.closest('li');
      const dropdown = parentItem.querySelector('.dropdown');
      
      // Diğer tüm açık accordionları kapat
      document.querySelectorAll('.dropdown').forEach(item => {
        if (item !== dropdown) {
          item.classList.remove('active');
        }
      });
      
      // Mevcut accordionu aç/kapat
      dropdown.classList.toggle('active');
      
      // Ok ikonunu döndür
      const icon = this.querySelector('i');
      if (dropdown.classList.contains('active')) {
        icon.style.transform = 'rotate(90deg)';
      } else {
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function() {
  // Footer accordion functionality
  const accordionHeaders = document.querySelectorAll('.grid2-text .accordion-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.classList.toggle('active');
        
        // Rotate icon
        const icon = this.querySelector('.icon-hover-bg i');
        if (this.classList.contains('active')) {
          icon.style.transform = 'rotate(90deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      }
    });
  });
});


document.addEventListener("DOMContentLoaded", function() {
  const accordionItems = document.querySelectorAll('.grid2-text');
  
  accordionItems.forEach(item => {
    const header = item.querySelector('h1');
    const icon = item.querySelector('.icon-hover-bg i');
    
    header.addEventListener('click', function() {
      // Sadece mobilde accordion çalışsın
      if (window.innerWidth <= 768) {
        // Diğer tüm accordionları kapat
        accordionItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            otherItem.querySelector('.icon-hover-bg i').style.transform = 'rotate(0deg)';
          }
        });
        
        // Mevcut accordionu aç/kapat
        item.classList.toggle('active');
        
        // İkonu döndür
        if (item.classList.contains('active')) {
          icon.style.transform = 'rotate(0deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      }
    });
  });
  
  // Ekran boyutu değiştiğinde kontrol et
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      // Masaüstünde tüm içerikleri göster
      accordionItems.forEach(item => {
        item.classList.remove('active');
        item.querySelector('.accordion-content').style.display = 'block';
        item.querySelector('.icon-hover-bg i').style.transform = 'rotate(0deg)';
      });
    } else {
      // Mobilde kapalı duruma getir
      accordionItems.forEach(item => {
        item.querySelector('.accordion-content').style.display = 'none';
      });
    }
  });
});