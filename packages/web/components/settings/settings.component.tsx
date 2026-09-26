import React from 'react';

import { SettingsComponentStyles } from './settings.styles';
import { SettingsFormComponent } from './settings-form.component';
import { ActionsComponents } from './actions.component';
import { QualityParamsComponent } from './quality-params.component';
import { TagsComponent } from './tags.component';

export function SettingsComponent() {
  return (
    <SettingsComponentStyles>
      <div className="wrapper">
        <h1>Settings</h1>
        <div className="flex">
          <div className="row">
            <h2>General</h2>
            <SettingsFormComponent />
            <h2>Indexers</h2>
            <TagsComponent />
          </div>
          <div className="row">
            <h2>Library actions</h2>
            <ActionsComponents />
            <h2>Quality</h2>
            <QualityParamsComponent />
          </div>
        </div>
      </div>
    </SettingsComponentStyles>
  );
}
