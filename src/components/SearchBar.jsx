import { forwardRef } from 'react';
import { Icon } from './Icon.jsx';

/**
 * Controlled search field. `ref` is forwarded so the parent can focus it from
 * a keyboard shortcut or from the results list.
 */
const SearchBar = forwardRef(function SearchBar(
  { id, value, onChange, onSubmit, placeholder = 'Search programs…', label = 'Search programs', showShortcut = false },
  ref
) {
  return (
    <form
      className="search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (onSubmit) onSubmit();
      }}
    >
      <label className="sr-only" htmlFor={id}>
        {label}
      </label>
      <span className="search-icon" aria-hidden="true">
        <Icon name="search" size={18} />
      </span>
      <input
        id={id}
        ref={ref}
        className="search-input"
        type="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          className="search-clear"
          onClick={() => {
            onChange('');
            if (ref && typeof ref === 'object' && ref.current) ref.current.focus();
          }}
        >
          <Icon name="close" size={16} />
          <span className="sr-only">Clear search</span>
        </button>
      ) : showShortcut ? (
        <span className="search-kbd" aria-hidden="true">
          /
        </span>
      ) : null}
    </form>
  );
});

export default SearchBar;
