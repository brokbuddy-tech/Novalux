import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhoWeAre from './components/WhoWeAre';
import FeaturedProperties from './components/FeaturedProperties';
import Neighborhoods from './components/Neighborhoods';
import Agents from './components/Agents';
import AgentsDirectoryPage from './components/AgentsDirectoryPage';
import AgentDetailPage from './components/AgentDetailPage';
import Testimonials from './components/Testimonials';
import BlogSection from './components/BlogSection';
import BlogArchivePage from './components/BlogArchivePage';
import BlogDetailPage from './components/BlogDetailPage';
import ContactPage from './components/ContactPage';
import FAQ from './components/FAQ';
import VisionCTA from './components/VisionCTA';
import Footer from './components/Footer';
import PropertyDetailModal from './components/PropertyDetailModal';
import ScheduleViewingModal from './components/ScheduleViewingModal';
import ContactAgentModal from './components/ContactAgentModal';
import FavoritesDrawer from './components/FavoritesDrawer';
import Toast from './components/Toast';
import PropertyCategoryPage from './components/PropertyCategoryPage';
import PropertyDetailPage from './components/PropertyDetailPage';
import PropertyMapPage from './components/PropertyMapPage';
import SellPropertyPage from './components/SellPropertyPage';
import AboutUsPage from './components/AboutUsPage';

import { PROPERTIES } from './data/properties';
import { AGENTS } from './data/agents';

export default function App() {
  // Routing State
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Programmatic navigation handler
  const handleNavigate = (path, callback) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (callback) callback();
  };

  // Favorites State (pre-seed with 2 favorites so user sees the counter right away)
  const [favorites, setFavorites] = useState(['prop-1', 'prop-3']);

  // Filters State from Hero search
  const [externalFilters, setExternalFilters] = useState(null);

  // Modals & Drawers State
  const [activePropertyModal, setActivePropertyModal] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedAgentForContact, setSelectedAgentForContact] = useState(null);
  const [isFavoritesDrawerOpen, setIsFavoritesDrawerOpen] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Toggle Favorite
  const handleToggleFavorite = (property) => {
    if (favorites.includes(property.id)) {
      setFavorites(favorites.filter(id => id !== property.id));
      showToast(`Removed "${property.title}" from saved portfolio.`, 'info');
    } else {
      setFavorites([...favorites, property.id]);
      showToast(`Saved "${property.title}" to private portfolio.`, 'success');
    }
  };

  // Neighborhood click handler -> filters to that neighborhood and scrolls to properties
  const handleSelectNeighborhood = (neighborhoodName) => {
    setExternalFilters({
      location: neighborhoodName,
      propertyType: 'All Types',
      priceMax: 60000000,
      bedrooms: 'Any'
    });
    
    if (currentPath !== '/') {
      handleNavigate('/', () => {
        setTimeout(() => {
          const propSection = document.getElementById('properties');
          if (propSection) {
            propSection.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      });
    } else {
      const propSection = document.getElementById('properties');
      if (propSection) {
        propSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
    showToast(`Viewing active residences in ${neighborhoodName}.`, 'info');
  };

  // Agent Contact Click
  const handleContactAgent = (agent) => {
    setSelectedAgentForContact(agent);
    setIsContactModalOpen(true);
  };

  const favoritePropertiesList = PROPERTIES.filter(p => favorites.includes(p.id));

  // Determine current active view
  const isAgentsDirectory = currentPath === '/agents' || currentPath === '/agents/';
  const isAgentDetail = currentPath.startsWith('/agents/') && !isAgentsDirectory;
  const agentSlug = isAgentDetail ? currentPath.replace('/agents/', '').replace(/\/$/, '') : null;
  const currentAgent = agentSlug ? AGENTS.find(a => a.slug === agentSlug || a.id === agentSlug) : null;

  // Property Selection Handler -> Navigates to individual dedicated listing page
  const handleSelectProperty = (property) => {
    handleNavigate(`/property/${property.id}`);
  };

  // Property Detail Route: /property/:id or /properties/:id (excluding category names)
  const isPropertyDetail = 
    currentPath.startsWith('/property/') || 
    (currentPath.startsWith('/properties/') && 
     !['buy', 'rent', 'off-plan', 'commercial'].includes(currentPath.replace(/^\/properties\//, '').replace(/\/$/, '')));

  const propertySlug = isPropertyDetail
    ? currentPath.replace(/^\/(property|properties)\//, '').replace(/\/$/, '')
    : null;

  const currentProperty = propertySlug
    ? PROPERTIES.find(p => p.id === propertySlug || p.id.toLowerCase() === propertySlug.toLowerCase())
    : null;

  // Property Category Routing (Buy, Rent, Off-Plan, Commercial)
  const isPropertiesCategory = 
    !isPropertyDetail && (
      currentPath === '/properties' || currentPath === '/properties/' ||
      currentPath.startsWith('/properties/buy') || currentPath === '/buy' || currentPath === '/buy/' ||
      currentPath.startsWith('/properties/rent') || currentPath === '/rent' || currentPath === '/rent/' ||
      currentPath.startsWith('/properties/off-plan') || currentPath === '/off-plan' || currentPath === '/off-plan/' ||
      currentPath.startsWith('/properties/commercial') || currentPath === '/commercial' || currentPath === '/commercial/'
    );

  let activePropertyCategory = 'buy';
  if (isPropertiesCategory) {
    if (currentPath.includes('/rent')) activePropertyCategory = 'rent';
    else if (currentPath.includes('/off-plan') || currentPath.includes('/offplan')) activePropertyCategory = 'off-plan';
    else if (currentPath.includes('/commercial')) activePropertyCategory = 'commercial';
    else activePropertyCategory = 'buy';
  }

  // Blog routing
  const isBlogArchive = currentPath === '/blog' || currentPath === '/blog/' || currentPath === '/blogs' || currentPath === '/blogs/';
  const isBlogDetail = (currentPath.startsWith('/blog/') && !isBlogArchive) || (currentPath.startsWith('/blogs/') && !isBlogArchive);
  const blogSlug = isBlogDetail ? currentPath.replace(/^\/(blog|blogs)\//, '').replace(/\/$/, '') : null;

  // Contact routing
  const isContact = currentPath === '/contact' || currentPath === '/contact/';

  // Sell Your Property routing (/sell or /sell-with-us)
  const isSell = currentPath === '/sell' || currentPath === '/sell/' || 
    currentPath === '/sell-with-us' || currentPath === '/sell-with-us/' ||
    currentPath.startsWith('/sell');

  // About Us routing (/about or /about-us)
  const isAbout = currentPath === '/about' || currentPath === '/about/' || 
    currentPath === '/about-us' || currentPath === '/about-us/' ||
    currentPath.startsWith('/about');

  // Map routing (/map or /properties/map)
  const isMap = currentPath === '/map' || currentPath === '/map/' || 
    currentPath.startsWith('/map') || currentPath === '/properties/map' || currentPath.startsWith('/properties/map');

  let initialMapArea = 'all';
  if (isMap && currentPath.includes('?')) {
    try {
      const params = new URLSearchParams(currentPath.split('?')[1]);
      if (params.get('area')) {
        initialMapArea = params.get('area');
      }
    } catch {
      initialMapArea = 'all';
    }
  }

  return (
    <div className={`w-full min-w-full bg-[#F9F9F8] text-[#1E293B] selection:bg-bronze selection:text-white flex flex-col ${
      isMap ? 'h-screen max-h-screen overflow-hidden' : 'min-h-screen overflow-x-clip'
    }`}>
      
      {/* SECTION 1: Sticky Navigation Bar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onScheduleClick={() => setIsScheduleModalOpen(true)}
        onContactClick={() => {
          handleNavigate('/contact');
        }}
        onFavoritesClick={() => setIsFavoritesDrawerOpen(true)}
        favoriteCount={favorites.length}
      />

      {/* DYNAMIC PAGE ROUTING LOGIC */}
      {isMap ? (
        /* DEDICATED PROPERTY MAP EXPLORER (/map) */
        <PropertyMapPage
          properties={PROPERTIES}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onNavigate={handleNavigate}
          initialArea={initialMapArea}
        />
      ) : isPropertyDetail ? (
        /* DEDICATED PROPERTY DETAIL PAGE (/property/[id]) */
        <PropertyDetailPage
          property={currentProperty}
          properties={PROPERTIES}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onNavigate={handleNavigate}
          onScheduleShowing={(booking) => {
            showToast(`Private showing requested for ${booking.propertyTitle}.`, 'success');
          }}
          onContactAdvisor={handleContactAgent}
          showToast={showToast}
        />
      ) : isAgentsDirectory ? (
        /* PAGE 1: ALL AGENTS DIRECTORY (/agents) */
        <AgentsDirectoryPage
          onNavigate={handleNavigate}
          onContactAgent={handleContactAgent}
        />
      ) : isAgentDetail ? (
        /* PAGE 2: INDIVIDUAL AGENT DETAIL & LISTINGS (/agents/[agent-slug]) */
        <AgentDetailPage
          agent={currentAgent}
          properties={PROPERTIES}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectProperty={handleSelectProperty}
          onNavigate={handleNavigate}
          onScheduleShowing={(booking) => {
            showToast(`Private showing requested for ${booking.propertyTitle}.`, 'success');
          }}
          onContactAgent={handleContactAgent}
        />
      ) : isPropertiesCategory ? (
        /* PAGE 3: DEDICATED PROPERTY CATEGORY PAGES (/properties/buy, /rent, /off-plan, /commercial) */
        <PropertyCategoryPage
          category={activePropertyCategory}
          properties={PROPERTIES}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectProperty={handleSelectProperty}
          onNavigate={handleNavigate}
          onContactClick={() => handleNavigate('/contact')}
        />
      ) : isBlogArchive ? (
        /* PAGE 4: BLOG ARCHIVE / DIRECTORY (/blog) */
        <BlogArchivePage
          onNavigate={handleNavigate}
        />
      ) : isBlogDetail ? (
        /* PAGE 4: INDIVIDUAL BLOG POST DETAIL (/blog/[slug]) */
        <BlogDetailPage
          slug={blogSlug}
          onNavigate={handleNavigate}
          onContactAuthor={(author) => {
            setSelectedAgentForContact({
              name: author.name,
              title: author.title,
              avatar: author.avatar,
              email: 'advisory@novalux.com',
              phone: '+1 (800) 492-8172'
            });
            setIsContactModalOpen(true);
          }}
          showToast={showToast}
        />
      ) : isContact ? (
        /* PAGE 5: CONTACT US PAGE (/contact) */
        <ContactPage
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      ) : isSell ? (
        /* PAGE 6: DEDICATED SELL YOUR PROPERTY PAGE (/sell) */
        <SellPropertyPage
          onNavigate={handleNavigate}
          onContactClick={() => handleNavigate('/contact')}
          showToast={showToast}
        />
      ) : isAbout ? (
        /* PAGE 7: DEDICATED ABOUT US PAGE (/about) */
        <AboutUsPage
          onNavigate={handleNavigate}
          onContactClick={() => handleNavigate('/contact')}
        />
      ) : (
        /* DEFAULT HOME LANDING PAGE (/) */
        <>
          {/* SECTION 2: Hero Section */}
          <Hero
            onNavigate={handleNavigate}
            onAISearch={(filterCriteria) => {
              if (filterCriteria.location || filterCriteria.propertyType) {
                setExternalFilters({
                  location: filterCriteria.location || 'All Locations',
                  propertyType: filterCriteria.propertyType || 'All Types',
                  priceMax: 60000000,
                  bedrooms: 'Any'
                });
              }
              const propSection = document.getElementById('properties');
              if (propSection) {
                propSection.scrollIntoView({ behavior: 'smooth' });
              }
              showToast(
                filterCriteria.query
                  ? `AI Discovery: Curating residences for "${filterCriteria.query}"...`
                  : `Filtering residences by ${filterCriteria.category.toUpperCase()} parameters...`,
                'info'
              );
            }}
          />

          {/* SECTION 3: WHO WE ARE (Value Proposition & Metrics with Dispersing Text Animation) */}
          <WhoWeAre />

          {/* SECTION 4: Featured Properties CMS Grid */}
          <FeaturedProperties
            properties={PROPERTIES}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProperty={handleSelectProperty}
            externalFilters={externalFilters}
            onResetFilters={() => setExternalFilters(null)}
            onViewAllClick={() => handleNavigate('/properties/buy')}
          />

          {/* SECTION 5: Neighborhood / Location Discovery (Bento Grid) */}
          <Neighborhoods
            onSelectNeighborhood={handleSelectNeighborhood}
            onNavigate={handleNavigate}
          />

          {/* SECTION 6: Recreated "OUR AGENTS" Section (3x2 Grid, Warm Off-White, Scroll Animations) */}
          <Agents
            onNavigate={handleNavigate}
          />

          {/* SECTION 8: Client Testimonials (Editorial Style, Off-White Contrast) */}
          <Testimonials />

          {/* SECTION 8.5: BLOGS / INSIGHTS Section (Directly below Testimonials) */}
          <BlogSection
            onNavigate={handleNavigate}
          />

          {/* SECTION 9: Curated FAQ Section */}
          <FAQ
            onContactClick={() => {
              handleNavigate('/contact');
            }}
          />

          {/* SECTION 10: "Find The Property That Fits Your Vision" CTA Section */}
          <VisionCTA
            onContactClick={() => {
              handleNavigate('/contact');
            }}
          />
        </>
      )}

      {/* SECTION 11: Footer (Persistent across all routes except full-screen map) */}
      {!isMap && (
        <Footer
          onNavigate={handleNavigate}
          onContactClick={() => {
            handleNavigate('/contact');
          }}
        />
      )}

      {/* Rich Interactive Modals & Drawers */}
      {activePropertyModal && (
        <PropertyDetailModal
          property={activePropertyModal}
          onClose={() => setActivePropertyModal(null)}
          isFavorite={favorites.includes(activePropertyModal.id)}
          onToggleFavorite={handleToggleFavorite}
          onScheduleShowing={(booking) => {
            showToast(`Private showing requested for ${booking.propertyTitle}.`, 'success');
          }}
        />
      )}

      {isScheduleModalOpen && (
        <ScheduleViewingModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          onSubmitSuccess={(data) => {
            showToast(`Viewing request confirmed for ${data.estate}.`, 'success');
          }}
        />
      )}

      {isContactModalOpen && (
        <ContactAgentModal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false);
            setSelectedAgentForContact(null);
          }}
          selectedAgent={selectedAgentForContact}
          onSubmitSuccess={(data) => {
            showToast(`Direct message transmitted to ${data.agentName}.`, 'success');
          }}
        />
      )}

      {isFavoritesDrawerOpen && (
        <FavoritesDrawer
          isOpen={isFavoritesDrawerOpen}
          onClose={() => setIsFavoritesDrawerOpen(false)}
          favoriteProperties={favoritePropertiesList}
          onRemoveFavorite={handleToggleFavorite}
          onSelectProperty={(prop) => {
            setIsFavoritesDrawerOpen(false);
            handleSelectProperty(prop);
          }}
          onScheduleAll={() => setIsScheduleModalOpen(true)}
        />
      )}

      {/* Global Interactive Feedback Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

    </div>
  );
}
