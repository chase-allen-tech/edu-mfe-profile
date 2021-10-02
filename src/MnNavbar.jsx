import React from 'react';
import { connect } from 'react-redux';

import { ensureConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { injectIntl } from '@edx/frontend-platform/i18n';

// Selectors
import { profilePageSelector } from './profile/data/selectors';

ensureConfig(['CREDENTIALS_BASE_URL', 'LMS_BASE_URL'], 'MnNavbar');

class MnNavbar extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      baseUrl: context.config.LMS_BASE_URL
    };
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-light p-0 mn-navbar">
        <div>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link text-uppercase text-white m-0 p-0 hover-opacity trans-2" href={`${this.state.baseUrl}/dashboard`}>Dashboard</a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-uppercase text-white m-0 hover-opacity trans-2" href={`${this.state.baseUrl}/catalog`}>Traning Catelog</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

MnNavbar.contextType = AppContext;

MnNavbar.propTypes = {};

MnNavbar.defaultProps = {};

export default connect(
  profilePageSelector, {},
)(injectIntl(MnNavbar));
