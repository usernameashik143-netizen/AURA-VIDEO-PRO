import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore.js';
import { Header } from './components/layout/Header.js';
import { Sidebar } from './components/layout/Sidebar.js';
import { MobileNav } from './components/layout/MobileNav.js';
import { ToastContainer } from './components/layout/ToastContainer.js';
import { OnboardingModal } from './components/onboarding/OnboardingModal.js';
import { AIAssistantModal } from './components/assistant/AIAssistantModal.js';

import { DashboardScreen } from './components/dashboard/DashboardScreen.js';
import { AutoEditScreen } from './components/autoedit/AutoEditScreen.js';
import { VideoEditorScreen } from './components/editor/VideoEditorScreen.js';
import { TemplatesScreen } from './components/templates/TemplatesScreen.js';
import { MyProjectsScreen } from './components/projects/MyProjectsScreen.js';
import { MediaLibraryScreen } from './components/media/MediaLibraryScreen.js';
import { ExportScreen } from './components/export/ExportScreen.js';
import { SettingsScreen } from './components/settings/SettingsScreen.js';
import { EffectsScreen } from './components/effects/EffectsScreen.js';
import { TransitionsScreen } from './components/transitions/TransitionsScreen.js';
import { SoundLibraryScreen } from './components/audio/SoundLibraryScreen.js';
import { AIToolsScreen } from './components/aitools/AIToolsScreen.js';

export const App: React.FC = () => {
  const { activeSection, fetchMedia, fetchProjects, fetchAudioLibrary, fetchAudioCategories } = useAppStore();

  useEffect(() => {
    fetchMedia();
    fetchProjects();
    fetchAudioCategories();
    fetchAudioLibrary();
  }, [fetchMedia, fetchProjects, fetchAudioCategories, fetchAudioLibrary]);

  // 1. Full editor mode — no chrome
  if (activeSection === 'editor') {
    return (
      <div className="flex h-screen w-screen bg-[#09090b] text-white overflow-hidden antialiased select-none">
        <VideoEditorScreen />
        <OnboardingModal />
        <AIAssistantModal />
        <ToastContainer />
      </div>
    );
  }

  // 4. Main dashboard shell
  return (
    <div className="flex flex-col h-screen w-screen bg-[#09090b] text-white overflow-hidden antialiased select-none">
      <Header />

      <main className="flex-1 flex overflow-hidden pb-16 md:pb-0">
        <Sidebar />

        <div className="flex-1 h-full overflow-hidden flex flex-col">
          {activeSection === 'dashboard'    && <DashboardScreen />}
          {activeSection === 'autoedit'     && <AutoEditScreen />}
          {activeSection === 'templates'    && <TemplatesScreen />}
          {activeSection === 'projects'     && <MyProjectsScreen />}
          {activeSection === 'media'        && <MediaLibraryScreen />}
          {activeSection === 'effects'      && <EffectsScreen />}
          {activeSection === 'transitions'  && <TransitionsScreen />}
          {activeSection === 'audio'        && <SoundLibraryScreen />}
          {activeSection === 'export'       && <ExportScreen />}
          {activeSection === 'settings'     && <SettingsScreen />}
          {activeSection === 'ai_tools'     && <AIToolsScreen />}
        </div>
      </main>

      <MobileNav />

      <OnboardingModal />
      <AIAssistantModal />
      <ToastContainer />
    </div>
  );
};

export default App;
