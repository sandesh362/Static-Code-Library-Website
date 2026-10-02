import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './components/Home.jsx';
import SubjectPage from './components/SubjectPage.jsx';
import CodeViewer from './components/CodeViewer.jsx';
import NotFound from './components/NotFound.jsx';
import { useHashRoute, useScrollToTop } from './lib/useHashRoute.js';
import { programs, subjects, getProgram, getSubject } from './data/programs.js';

function documentTitle(route) {
  const brand = 'CodeShelf';
  if (route.name === 'subject') {
    const subject = getSubject(route.subjectId);
    return subject ? `${subject.name} — ${brand}` : `Subject not found — ${brand}`;
  }
  if (route.name === 'program') {
    const program = getProgram(route.programId);
    return program
      ? `${program.title}${program.language ? ` (${program.language})` : ''} — ${brand}`
      : `Program not found — ${brand}`;
  }
  if (route.name === 'not-found') return `Page not found — ${brand}`;
  return `${brand} — Your Practical Code Library`;
}

/**
 * Shell + routing. The home page owns the search query; every other page is
 * derived from the route, so nothing here knows about a specific program.
 */
export default function App() {
  const route = useHashRoute();
  const [query, setQuery] = useState('');

  const routeKey = `${route.name}:${route.subjectId || ''}:${route.programId || ''}`;
  useScrollToTop(routeKey);

  useEffect(() => {
    document.title = documentTitle(route);
  }, [route]);

  // Leaving the home page resets the home search box.
  useEffect(() => {
    if (route.name !== 'home') setQuery('');
  }, [route.name]);

  let view;
  if (route.name === 'subject') {
    const subject = getSubject(route.subjectId);
    view = subject ? (
      <SubjectPage subject={subject} />
    ) : (
      <NotFound
        title="Subject not found"
        message="That subject is not part of this library yet. Add it to src/data/programs.js to publish it."
      />
    );
  } else if (route.name === 'program') {
    const subject = getSubject(route.subjectId);
    const program = getProgram(route.programId);
    const belongsToSubject = Boolean(
      program && subject && program.subjectId === subject.id
    );
    view = belongsToSubject ? (
      <CodeViewer program={program} subject={subject} />
    ) : (
      <NotFound
        title="Program not found"
        message="That program is not in this library. Add it to src/data/programs.js to publish it."
      />
    );
  } else if (route.name === 'not-found') {
    view = (
      <NotFound title="Page not found" message="The page you were looking for does not exist." />
    );
  } else {
    view = <Home query={query} onQueryChange={setQuery} />;
  }

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header activeSubjectId={route.name === 'home' ? null : route.subjectId} />
      <main id="main" className="main" tabIndex={-1}>
        {view}
      </main>
      <Footer programCount={programs.length} subjectCount={subjects.length} />
    </div>
  );
}
