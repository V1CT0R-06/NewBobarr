// import original module declarations
import 'styled-components';

// and extend them!
declare module 'styled-components' {
  export interface DefaultTheme {
    mode: 'dark' | 'light';
    navbarHeight: number;
    tmdbCardHeight: number;
    colors: {
      background: string;
      surface: string;
      surfaceElevated: string;
      text: string;
      mutedText: string;
      border: string;
      navbarBackground: string;
      buttonBackground: string;
      buttonText: string;
      hover: string;
      coral: string;
      blue: string;
      success: string;
      warning: string;
      error: string;
    };
  }
}
