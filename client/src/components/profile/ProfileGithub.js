import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getGithubRepos } from '../../actions/profile';
import Spinner from '../layout/Spinner';

const ProfileGithub = ({ username, loading, getGithubRepos, repos, auth }) => {
  useEffect(() => {
    getGithubRepos(username);

    
  }, [getGithubRepos]); //'exhaustive-deps' lint rule error
 

  return (
    <div className="profile-github">
      <h2 className="text-primary my-1">Github Repos</h2>
      {repos === null ? (
        <Spinner />
      ) : (
        repos.map((repos) => (
          <div key={repos.id} className="repo bg-white p-1 my-1">
            <div>
              <h4>
                <a
                  href={repos.html_url}
                  target="blank"
                  rel="noopener noreferrer"
                >
                  {repos.name}
                </a>
              </h4>
              <p>{repos.description}</p>
            </div>
            <div>
              <ul>
                <li className="badge badge-primary">
                  Stars: {repos.stargazers_count}
                </li>
                <li className="badge badge-dark">
                  Watchers: {repos.watchers_count}
                </li>
                <li className="badge badge-light">
                  Forks: {repos.forks_count}
                </li>
              </ul>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

ProfileGithub.propTypes = {
  getGithubRepos: PropTypes.func.isRequired,
  repos: PropTypes.array.isRequired,
  username: PropTypes.string.isRequired,
};
const mapStateToProps = (state) => ({
  repos: state.profile.repos,
});

export default connect(mapStateToProps, { getGithubRepos })(ProfileGithub);
