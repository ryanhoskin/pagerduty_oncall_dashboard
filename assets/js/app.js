function format_date(my_date) {
    return String("00"+(my_date.getMonth()+1)).slice(-2)+'/'+String("00"+my_date.getDate()).slice(-2)+'/'+my_date.getFullYear()+' '+String("00"+my_date.getHours()).slice(-2)+':'+String("00"+my_date.getMinutes()).slice(-2)
}
  
// take the user ID - and add the email, phone, and sms contact methods to the user id
// API call: https://v2.developer.pagerduty.com/v2/page/api-reference#!/Users/get_users_id_contact_methods
get_contact_methods = function(ID) {
PDJS.api({
    res:'/users/' + ID + '/contact_methods',
    success: function(data){
    jQuery.each( data.contact_methods, function(index,contact_method){
        if(contact_method.type.includes("email")){
        $("#"+ID+"_contact_methods").append('<li><strong>Email:</strong> <a href="mailto:'+contact_method.address+'">'+contact_method.address+'</a> ('+contact_method.summary+')</li>');
        } else if (contact_method.type.includes("phone")){
        $("#"+ID+"_contact_methods").append('<li><strong>Phone:</strong> +'+contact_method.country_code+' '+contact_method.address+' ('+contact_method.summary+')</li>');
        } else if (contact_method.type.includes("sms")){
        $("#"+ID+"_contact_methods").append('<li><strong>Sms:</strong> +'+contact_method.country_code+' '+contact_method.address+' ('+contact_method.summary+')</li>');
        }
    })
    }
})
}

// remember if a users initial box UI and contact methods have already been added to the page
const user_exists = [];
function is_new_user(ID){
    return user_exists.includes(ID);
}

update_users = function() {
    PDJS.api({
        res: "oncalls?include[]=users",
        success: function(data) {
            jQuery.each( data.oncalls, function(index, oncall){
                var escalation_policy = oncall.escalation_policy;
                var user = oncall.user;
                
                // if specific user already exists on the page, don't duplicate the contact methods / table
                if(is_new_user(user.id)){
                // skip to add the on call times
                } else {
                    user_exists.push(user.id);
                    $("#users").append(
                        '<table border=1 bordercolor="#cccccc" dashed><tr><td><table border=0 cellpadding=3 cellspacing=0 width=440><tr><td width=80><div id="'+user.id+'"><div><img src="'+user.avatar_url+'"></td><td><h2><a href="http://'+pdjs_settings.subdomain+'.pagerduty.com/users/'+user.id+'">'+user.name+'</a></td></tr><tr><td colspan=2></h2></div><div id="'+user.id+"_contact_methods"+'"><h4>Contact Methods:</h4></div></td></tr><tr><td colspan=2><div id="'+user.id+"_on_call"+'"</div></td></tr></table></td></tr></table><br>'
                    )
                    if(!user.contact_methods.length) {
                        $("#"+user.id+"_contact_methods").append("<li><font color=red>No Phone or Email contact methods</font></li>")
                    }
                    // if the user has contact method, let's get them and display them on the page
                    else {
                        get_contact_methods(user.id);
                        
                    }
                }

                // always add the escalation policy that the user is on-call for
                $("#"+user.id+"_on_call").append(
                    '<h4><a href=' + escalation_policy.html_url + '>'+escalation_policy.summary+'</a></h4><span class="badge">'+oncall.escalation_level+'</span>'
                )
                if(oncall.start == null) {
                    $("#"+user.id+"_on_call").append(' Always on-call')
                }
                else {
                    var start = new Date(oncall.start)
                    var end = new Date(oncall.end)
                    $("#"+user.id+"_on_call").append(' '+format_date(start)+' - '+format_date(end))
                }
            })
        }
    })
}
  
  $(function(){
    PDJS = new PDJSobj(pdjs_settings)
    update_users()
  })