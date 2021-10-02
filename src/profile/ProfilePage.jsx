import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { sendTrackingLogEvent } from '@edx/frontend-platform/analytics';
import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { AppContext } from '@edx/frontend-platform/react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { StatusAlert, Hyperlink } from '@edx/paragon';

import profileImg1 from './assets/profile1.png';
import profileImg2 from './assets/profile2.png';
import profileImg3 from './assets/profile3.png';
import profileImg4 from './assets/profile4.png';
import imgStarRed from "./assets/starred.svg";
import imgStarBlue from "./assets/starblue.svg";
import imgProfileCard1 from "./assets/profile-card1.png";
import imgProfileCard2 from "./assets/profile-card2.png";

// Actions
import {
  fetchProfile,
  saveProfile,
  saveProfilePhoto,
  deleteProfilePhoto,
  openForm,
  closeForm,
  updateDraft,
} from './data/actions';

// Components
import ProfileAvatar from './forms/ProfileAvatar';
import Name from './forms/Name';
import Country from './forms/Country';
import PreferredLanguage from './forms/PreferredLanguage';
import Education from './forms/Education';
import SocialLinks from './forms/SocialLinks';
import Bio from './forms/Bio';
import Certificates from './forms/Certificates';
import AgeMessage from './AgeMessage';
import DateJoined from './DateJoined';
import PageLoading from './PageLoading';
import Banner from './Banner';
import { LazyShow } from './screen';

// Selectors
import { profilePageSelector } from './data/selectors';

// i18n
import messages from './ProfilePage.messages';

ensureConfig(['CREDENTIALS_BASE_URL', 'LMS_BASE_URL'], 'ProfilePage');

class ProfilePage extends React.Component {
  constructor(props, context) {
    super(props, context);

    const recordsUrl = this.getRecordsUrl(context);

    this.animParentRef = React.createRef();

    this.state = {
      viewMyRecordsUrl: recordsUrl,
      accountSettingsUrl: `${context.config.LMS_BASE_URL}/account/settings`,
      parentDimension: {
        width: null, height: null
      }
    };

    this.handleSaveProfilePhoto = this.handleSaveProfilePhoto.bind(this);
    this.handleDeleteProfilePhoto = this.handleDeleteProfilePhoto.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.props.fetchProfile(this.props.match.params.username);
    sendTrackingLogEvent('edx.profile.viewed', {
      username: this.props.match.params.username,
    });

    // // if(this.animParentRef.current) {
    //   this.setState({
    //     parentDimension: {
    //       // width: this.animParentRef.current.offsetWidth, height: this.animParentRef.current.offsetHeight
    //       width: 400, height: 250
    //     }
    //   });
    // }

    setTimeout(() => {
      let ele = document.getElementById('refElement');
      this.setState({
        parentDimension: {
          width: ele.offsetWidth, height: 254
        }
      })
    }, 1500)
  }

  getRecordsUrl(context) {
    let recordsUrl = null;

    if (getConfig().ENABLE_LEARNER_RECORD_MFE) {
      recordsUrl = getConfig().LEARNER_RECORD_MFE_BASE_URL;
    } else {
      const credentialsBaseUrl = context.config.CREDENTIALS_BASE_URL;
      recordsUrl = credentialsBaseUrl ? `${credentialsBaseUrl}/records` : null;
    }

    return recordsUrl;
  }

  isAuthenticatedUserProfile() {
    return this.props.match.params.username === this.context.authenticatedUser.username;
  }

  handleSaveProfilePhoto(formData) {
    this.props.saveProfilePhoto(this.context.authenticatedUser.username, formData);
  }

  handleDeleteProfilePhoto() {
    this.props.deleteProfilePhoto(this.context.authenticatedUser.username);
  }

  handleClose(formId) {
    this.props.closeForm(formId);
  }

  handleOpen(formId) {
    this.props.openForm(formId);
  }

  handleSubmit(formId) {
    this.props.saveProfile(formId, this.context.authenticatedUser.username);
  }

  handleChange(name, value) {
    this.props.updateDraft(name, value);
  }

  // Inserted into the DOM in two places (for responsive layout)
  renderViewMyRecordsButton() {
    if (!(this.state.viewMyRecordsUrl && this.isAuthenticatedUserProfile())) {
      return null;
    }

    return (
      <Hyperlink className="btn btn-primary" destination={this.state.viewMyRecordsUrl} target="_blank">
        {this.props.intl.formatMessage(messages['profile.viewMyRecords'])}
      </Hyperlink>
    );
  }

  // Inserted into the DOM in two places (for responsive layout)
  renderHeadingLockup() {
    const { dateJoined } = this.props;

    return (
      <>
        <span data-hj-suppress>
          <h1 className="h2 mb-0 font-weight-bold">{this.props.match.params.username}</h1>
          <DateJoined date={dateJoined} />
          <hr className="d-none d-md-block" />
        </span>
      </>
    );
  }

  renderPhotoUploadErrorMessage() {
    const { photoUploadError } = this.props;

    if (photoUploadError === null) {
      return null;
    }

    return (
      <div className="row">
        <div className="col-md-4 col-lg-3">
          <StatusAlert alertType="danger" dialog={photoUploadError.userMessage} dismissible={false} open />
        </div>
      </div>
    );
  }

  renderAgeMessage() {
    const { requiresParentalConsent } = this.props;
    const shouldShowAgeMessage = requiresParentalConsent && this.isAuthenticatedUserProfile();

    if (!shouldShowAgeMessage) {
      return null;
    }
    return <AgeMessage accountSettingsUrl={this.state.accountSettingsUrl} />;
  }

  renderContent() {
    const {
      profileImage,
      name,
      visibilityName,
      country,
      visibilityCountry,
      levelOfEducation,
      visibilityLevelOfEducation,
      socialLinks,
      draftSocialLinksByPlatform,
      visibilitySocialLinks,
      languageProficiencies,
      visibilityLanguageProficiencies,
      visibilityCourseCertificates,
      bio,
      visibilityBio,
      requiresParentalConsent,
      isLoadingProfile,
    } = this.props;

    let nameLogo = 'UN';
    if (name) {
      let nameArray = name.split(" ");
      if (nameArray.length >= 2) {
        nameLogo = nameArray[0].substring(0, 1) + nameArray[1].substring(0, 1);
      } else if (name.length >= 2) {
        nameLogo = name.substring(0, 2);
      } else if (name) {
        nameLogo = name;
      }
    }


    if (isLoadingProfile) {
      return <PageLoading srMessage={this.props.intl.formatMessage(messages['profile.loading'])} />;
    }

    const commonFormProps = {
      openHandler: this.handleOpen,
      closeHandler: this.handleClose,
      submitHandler: this.handleSubmit,
      changeHandler: this.handleChange,
    };

    return (
      <div className="container mt-100 p-main">
        <div className="row">
          <div className="col-lg-4 mb-5">
            <div className="px-5 pb-5 shadow-main text-center  bg-white">
              <div className="c-profile-avatar text-uppercase">
                {nameLogo}
              </div>
              <div style={{ marginTop: -50 }}>
                <h2 className="fsp-32 lh-48 text-a fw-bold">{name}</h2>
                <p className="text-b fsp-16 fw-normal lh-25">TraningAdvisor / Corporate Relation Officer</p>
                <Name
                  name={name}
                  visibilityName={visibilityName}
                  formId="name"
                  {...commonFormProps}
                />
                <div className="d-grid gap-2">
                  <a href={this.state.accountSettingsUrl} className="btn border border-dark rounded hover-opacity trans-2 fsp-14 fw-500 text-b lh-22">Edit My Profile <i
                    className="bi bi-pencil-fill"></i></a>
                </div>
              </div>

            </div>
          </div>
          <div className="col-lg-8">
            <div className="row text-center" style={{ marginBottom: 60 }}>
              <div className="col-lg-3">
                <img src={profileImg1} className="size-60 mb-3" />
                <h3 className="mt-2 fsp-35 lh-25 fw-normal">1 </h3>
                <p className="text-b fsp-14 lh-23 color-profile-a">Over due</p>
              </div>
              <div className="col-lg-3">
                <img src={profileImg2} className="size-60 mb-3" />
                <h3 className="mt-2 fsp-35 lh-25 fw-normal">1 </h3>
                <p className="text-b fsp-14 lh-23 color-profile-a">Validated module </p>
              </div>
              <div className="col-lg-3">
                <img src={profileImg3} className="size-60 mb-3" />
                <h3 className="mt-2 fsp-35 lh-25 fw-normal">0 </h3>
                <p className="test-b fsp-14 lh-23 color-profile-a">Certification obtained</p>
              </div>
              <div className="col-lg-3">
                <img src={profileImg4} className="size-60 mb-3" />
                <h3 className="mt-2 fsp-35 lh-25 fw-normal">0 </h3>
                <p className="text-b fsp-14 lh-23 color-profile-a">Training completed</p>
              </div>
            </div>

            <div className="mt-4 shadow-main">
              <p className="text-b fsp-16 fw-normal lh-25 color-profile-a">Trainings attended</p>
              <div className="bg-white p-4">
                <div className="w-100" style={{ display: 'inline-block' }}>
                  <p className="float-left m-0">
                    <span className="text-a fsp-16 fw-bold lh-25">Remote manager</span><br />
                    <span className="fs-5 text-b fsp-14 lh-23 color-profile-a">1/4 module validated</span>
                  </p>
                  <p className="fsp-14 lh-23 color-profile-a float-right" style={{ marginLeft: 10, marginBottom: 0 }}>24%</p>
                  <div className="progress float-right mt-2 border-0" style={{ width: 100, height: 5, backgroundColor: '#e9ecef' }}>
                    <div style={{ width: '40%', background: "linear-gradient(90.5deg, #FF7D7D 0%, #FAD8D8 121.16%)" }} ></div>
                  </div>
                </div>
              </div>
            </div>


            <p className="mt-5 text-center fsp-16 fw-normal lh-25">Activities</p>

            <div className="row">
              <div ref={this.animParentRef} id="refElement" className="col-6 border-right htp-254 position-relative" style={{ borderWidth: 2 }}>
                <div className="position-absolute size-13 bg-progress rounded-pill circle1"></div>
                <div className="position-absolute size-13 bg-progress rounded-pill circle2"></div>
                <div className="position-relative w-100">

                  {
                    this.state.parentDimension && this.state.parentDimension.height &&
                    <LazyShow initX={this.state.parentDimension.width * 1.5} initY={this.state.parentDimension.height / 2 - 5} targetX={this.state.parentDimension.width} targetY={this.state.parentDimension.height / 2 - 5} isW100={false}>
                      <div className="fsp-14 lh-23 fw-normal color-progress ">July 2021</div>
                    </LazyShow>
                  }

                  {
                    this.state.parentDimension && this.state.parentDimension.height &&
                    <LazyShow initX={-this.state.parentDimension.width} initY={this.state.parentDimension.height / 4 - 5} targetX={0} targetY={this.state.parentDimension.height / 4 - 5}>
                      <div className="">
                        <div className="bg-white shadow-main p-4 text-center position-relative">
                          <div className="position-absolute start-50 card-star-red">
                            <img src={imgStarRed} className="size-17 rotating" alt="" />
                          </div>
                          <div className="position-absolute start-50 card-star-blue">
                            <img src={imgStarBlue} className="size-17 rotating" alt="" />
                          </div>
                          <img src={imgProfileCard1} className="size-46" alt="" />
                          <p className="fsp-16 fw-normal lh-25 mb-0 mt-2">I have validated <b>module 1</b> for the Remote<br />
                            <b>Manager</b> training !
                  </p>
                        </div>
                      </div>
                    </LazyShow>
                  }
                </div>
              </div>
              <div className="col-6"></div>
              <div className="col-3"></div>
              <div className="col-6">
                <div className="position-relative w-100 hp-180 overflow-y-hidden">
                  <LazyShow initX={0} initY={100} targetX={0} targetY={0}>
                    <div className="w-100">
                      <div id="framer-bottom-card" className="text-center w-100">
                        <div className="fsp-14 lh-23 fw-normal color-progress mb-1 txt2">
                          July 2021</div>
                        <div className="bg-white shadow-main mt-2 mb-5 text-center float-right w-100 card2-content">
                          <img src={imgProfileCard2} className="size-46" alt="" />
                          <p className="fsp-16 fw-bold lh-25 mb-0 mt-2">My date of arrival on the platform</p>
                        </div>
                      </div>
                    </div>
                  </LazyShow>
                </div>
              </div>
              <div className="col-3"></div>
            </div>

          </div>
        </div>
      </div>

    );
  }

  render() {
    return (
      <div className="profile-page">
        {this.renderContent()}
      </div>
    );
  }
}

ProfilePage.contextType = AppContext;

ProfilePage.propTypes = {
  // Account data
  requiresParentalConsent: PropTypes.bool,
  dateJoined: PropTypes.string,

  // Bio form data
  bio: PropTypes.string,
  visibilityBio: PropTypes.string.isRequired,

  // Certificates form data
  courseCertificates: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string,
  })),
  visibilityCourseCertificates: PropTypes.string.isRequired,

  // Country form data
  country: PropTypes.string,
  visibilityCountry: PropTypes.string.isRequired,

  // Education form data
  levelOfEducation: PropTypes.string,
  visibilityLevelOfEducation: PropTypes.string.isRequired,

  // Language proficiency form data
  languageProficiencies: PropTypes.arrayOf(PropTypes.shape({
    code: PropTypes.string.isRequired,
  })),
  visibilityLanguageProficiencies: PropTypes.string.isRequired,

  // Name form data
  name: PropTypes.string,
  visibilityName: PropTypes.string.isRequired,

  // Social links form data
  socialLinks: PropTypes.arrayOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })),
  draftSocialLinksByPlatform: PropTypes.objectOf(PropTypes.shape({
    platform: PropTypes.string,
    socialLink: PropTypes.string,
  })),
  visibilitySocialLinks: PropTypes.string.isRequired,

  // Other data we need
  profileImage: PropTypes.shape({
    src: PropTypes.string,
    isDefault: PropTypes.bool,
  }),
  saveState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  savePhotoState: PropTypes.oneOf([null, 'pending', 'complete', 'error']),
  isLoadingProfile: PropTypes.bool.isRequired,

  // Page state helpers
  photoUploadError: PropTypes.objectOf(PropTypes.string),

  // Actions
  fetchProfile: PropTypes.func.isRequired,
  saveProfile: PropTypes.func.isRequired,
  saveProfilePhoto: PropTypes.func.isRequired,
  deleteProfilePhoto: PropTypes.func.isRequired,
  openForm: PropTypes.func.isRequired,
  closeForm: PropTypes.func.isRequired,
  updateDraft: PropTypes.func.isRequired,

  // Router
  match: PropTypes.shape({
    params: PropTypes.shape({
      username: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,

  // i18n
  intl: intlShape.isRequired,
};

ProfilePage.defaultProps = {
  saveState: null,
  savePhotoState: null,
  photoUploadError: {},
  profileImage: {},
  name: null,
  levelOfEducation: null,
  country: null,
  socialLinks: [],
  draftSocialLinksByPlatform: {},
  bio: null,
  languageProficiencies: [],
  courseCertificates: null,
  requiresParentalConsent: null,
  dateJoined: null,
};

export default connect(
  profilePageSelector,
  {
    fetchProfile,
    saveProfilePhoto,
    deleteProfilePhoto,
    saveProfile,
    openForm,
    closeForm,
    updateDraft,
  },
)(injectIntl(ProfilePage));
