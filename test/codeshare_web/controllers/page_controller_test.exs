defmodule CodeshareWeb.PageControllerTest do
  use CodeshareWeb.ChannelCase

  setup do
    {:ok, _, socket} =
        socket("user_id", %{user_id: 12345})
        |> subscribe_and_join(CodeshareWeb.RoomChannel, "room:lobby")
    {:ok, socket: socket}
  end

  test "ping replies with status ok", %{socket: socket} do
    IO.inspect socket
    ref = push(socket, "ping", %{"hello" => "there"})
    assert_reply ref, :ok, %{"hello" => "there"}
  end
 
  test "shout broadcasts to room:lobby", %{socket: socket} do
    push(socket, "shout", %{"hello" => "all"})
    assert_broadcast "shout", %{"hello" => "all"}
    assert_push "shout", %{"hello" => "all"} 
  end
end
