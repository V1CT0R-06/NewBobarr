import React from 'react';
import Document, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { ServerStyleSheet } from 'styled-components';
import { resetServerContext } from 'react-beautiful-dnd';

export default class MyDocument extends Document {
  public static async getInitialProps(ctx: DocumentContext) {
    resetServerContext();

    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      // eslint-disable-next-line no-param-reassign
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: (
          <>
            {initialProps.styles}
            {sheet.getStyleElement()}
          </>
        ),
      };
    } finally {
      sheet.seal();
    }
  }

  public render() {
    return (
      <Html>
        <Head />
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  try {
                    var theme = localStorage.getItem('bobarr-theme') || 'dark';
                    document.documentElement.dataset.theme = theme;
                    document.documentElement.style.background = theme === 'light' ? '#f4f7fb' : '#111827';
                  } catch (error) {}
                })();
              `,
            }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
