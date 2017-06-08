import axios from 'axios';

const id = '6563c2f8c42e76d0c969';
const sec = 'a970f3c57f0be2335f7acf6fba1e0bb1cb25de9c';
const params = `?client_id=${id}&client_secret${sec}`;

function getProfile(username) {
  return axios.get(`https://api.github.com/users/${username}${params}`)
    .then(user => user.data);
}

function getRepos(username) {
  return axios.get(`https://api.github.com/users/${username}/repos${params}&per_page=100`);
}

function getStarCount(repos) {
  return repos.data.reduce((count, repo) => count + repo.stargazers_count, 0);
}

function calculateScore(profile, repos) {
  const followers = profile.followers;
  const totalStars = getStarCount(repos);

  return (followers * 3) + totalStars;
}

function handleError(error) {
  console.warn(error);
  return null;
}

function getUserData(player) {
  return axios.all([
    getProfile(player),
    getRepos(player),
  ]).then((data) => {
    const profile = data[0];
    const repos = data[1];

    return {
      profile,
      score: calculateScore(profile, repos),
    };
  });
}

function sortPlayers(players) {
  return players.sort((a, b) => b.score - a.score);
}

module.exports = {
  battle(players) {
    return axios.all(players.map(getUserData))
      .then(sortPlayers)
      .catch(handleError);
  },
  fetchPopularRepos: (language) => {
    const encodedURI = window.encodeURI(`https://api.github.com/search/repositories?q=stars:>1+language:${language}&sort=stars&order=desc&type=Repositories`);

    return axios.get(encodedURI)
      .then(response => response.data.items);
  },
};
