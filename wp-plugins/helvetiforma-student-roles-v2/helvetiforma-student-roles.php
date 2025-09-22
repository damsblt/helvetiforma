<?php
/*
Plugin Name: HelvetiForma Student Roles (v2)
Description: Ensure new users get subscriber+customer roles and add Tutor student capability. Expose simple REST to set roles+capabilities.
Version: 1.0.1
*/

add_action("user_register", function ($user_id) {
    $user = get_user_by("id", $user_id);
    if (!$user) { return; }
    if (!in_array("subscriber", $user->roles, true)) { $user->add_role("subscriber"); }
    if (!in_array("customer", $user->roles, true)) { $user->add_role("customer"); }
    if (!user_can($user, "tutor_student")) { $user->add_cap("tutor_student", true); }
}, 10, 1);

add_action("rest_api_init", function(){
    register_rest_route("helvetiforma/v1", "/set-student/(?P<id>\\d+)", [
        "methods" => "POST",
        "permission_callback" => function(){ return current_user_can("manage_options"); },
        "callback" => function($req){
            $id = intval($req["id"]);
            $user = get_user_by("id", $id);
            if (!$user) { return new WP_Error("not_found", "User not found", ["status"=>404]); }
            $user->add_role("subscriber");
            $user->add_role("customer");
            $user->add_cap("tutor_student", true);
            return [ "id"=>$id, "roles"=>$user->roles, "caps"=> array_keys($user->allcaps) ];
        }
    ]);
});
?>
