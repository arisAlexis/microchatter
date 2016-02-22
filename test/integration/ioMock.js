module.exports = {
  to: (username) => {
    console.log('emitting to ' + username);
    return {
      emit: (event, object) => console.log(event, object)
    };
  },
};
