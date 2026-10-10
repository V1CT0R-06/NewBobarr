import React, { useContext, useState } from 'react';
import cx from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BulbOutlined, MenuOutlined } from '@ant-design/icons';

import { useGetParamsQuery } from '../../utils/graphql';
import { ThemeModeContext } from '../theme-context';
import { NavbarStyles } from './navbar.styles';

const links = [
  ['Movies', '/library/movies'],
  ['TV Shows', '/library/tvshows'],
  ['Search', '/search'],
  ['Discover', '/discover'],
  ['Suggestions', '/suggestions'],
  ['Calendar', '/calendar'],
  ['Settings', '/settings'],
];

export function NavbarComponent() {
  const router = useRouter();
  const { data } = useGetParamsQuery();
  const { mode, toggleMode } = useContext(ThemeModeContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <NavbarStyles>
      <div className="wrapper">
        <div className="brand-row">
          <Link href="/library/movies" passHref={true}>
            <a className="logo">bobarr</a>
          </Link>
          <button
            type="button"
            className="mobile-menu-button"
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={`${isMenuOpen ? 'Close' : 'Open'} navigation menu`}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <MenuOutlined />
            Menu
          </button>
        </div>
        <nav
          id="mobile-navigation"
          className={cx('links', { open: isMenuOpen })}
          aria-label="Main navigation"
        >
          {links.map(([name, url]) => (
            <Link key={url} href={url} passHref={true}>
              <a
                className={cx({ active: url === router.pathname })}
                onClick={() => setIsMenuOpen(false)}
              >
                {name}
              </a>
            </Link>
          ))}
        </nav>
        <div className="utility-controls" aria-label="Display options">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleMode}
            aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
          >
            <BulbOutlined />
            {mode === 'dark' ? 'Dark' : 'Light'}
          </button>
          <div className="region-select">{data?.params?.region || 'US'}</div>
        </div>
      </div>
    </NavbarStyles>
  );
}
