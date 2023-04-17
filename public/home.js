let socket; //my socket
      let onlineUsers = [];
      let username;

      window.onload = () =>{
        console.log("Mở kết nối đến server");
        socket = io(); // connect to server
        socket.on('connect', handleConnectionSuccess);
        socket.on('disconnect', () => console.log("Đã mất kết nối với server"));
        // socket.on('error', () => console.log("Đã gặp lỗi"+ e.message));
        // socket.on('message', m => {
        //   console.log(`Đã nhận được 1 tin nhắn ${m}`)
        //   socket.send(m.toUpperCase())
        // }
        // );
        socket.on('list-users', handleUserList);
        socket.on('new-user', handleNewUser);
        socket.on('user-leave', handleUserLeave);
        socket.on('register-name', handleRegisteringUsername);

      } 
      function handleRegisteringUsername(data){
          let {id, username} = data;
          let user = onlineUsers.find(u => u.id == id);
          if(!user){
            return console.log('Không tìm thấy user');
          }
          user.username = username;
          console.log(`Client ${id} đã đăng kí tên: ${username}`);
      }

      function handleConnectionSuccess(){
        console.log('Đã kết nối thành công với id: '+ socket.id);
        if(!username){
          username  = prompt('Nhập tên của bạn: ');
        }

        socket.emit('register-name', username); //Gửi tên qua cho server
      }

      function handleUserList(users) {
          console.log('Đã nhận danh sách user online từ server');
          users.forEach(u =>{
            console.log(u)
            if(u.id !== socket.id){
              onlineUsers.push(u); //Thêm các user vào danh sách (ngoại trừ chính mình)
            }
          })
      }

      function handleNewUser(user){
          onlineUsers.push(user) // Thêm người dùng mới vào danh sách
          console.log(`Một người mới đã kết nối. Ngoài bạn ra, có ${onlineUsers.length} user đang online`);
          console.log(user);
      }

      function handleUserLeave(id){
        onlineUsers = onlineUsers.filter(u => u.id != id);
        console.log(`User ${id} đã thoát. Ngoài bạn ra, chỉ còn ${onlineUsers.length} user trong phòng`);
      }

      function displayUser(user){
        let status = user.free ? '<div class="badge badge-success badge-pill">Đang rảnh</div>' : '<div class="badge badge-success badge-warning">Đang bận</div>'
        let userDiv = $(`
            <div class="user" id="${user.id}">
                  <div class="avatar">${user.username[0]}</div>
                  <div class="user-info">
                    <div class="user-name" >${user.username}</div>
                    <div class="online">Truy cập lúc: ${user.loginAt}</div>
                  </div>
                  <div class="status">
                    ${status}
                  </div>
                </div>
        `)
        $('#user-list').append(userDiv);
        $('#online-count').html($('#user-list .user').length)
      }
      
      function removeUser(id){
        $(`#${id}`).remove();
        $('#online-count').html($('#user-list.user').length) // Cập nhật số người online
      }