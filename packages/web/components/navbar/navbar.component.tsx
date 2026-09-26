import React, { useContext } from 'react';
import cx from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { BulbOutlined } from '@ant-design/icons';

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

  return (
    <NavbarStyles>
      <div className="wrapper">
        <div className="logo">bobarr</div>
        <div className="links">
          {links.map(([name, url]) => (
            <Link key={url} href={url} passHref={true}>
              <a className={cx({ active: url === router.pathname })}>{name}</a>
            </Link>
          ))}
        </div>
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
    </NavbarStyles>
  );
}
