import {supabase} from '../config/supabaseClient';
import Swal from 'sweetalert2';


     //universal functions

//DELETE FUNCTION

export const deleteRecord = async (tableName , id , onSuccessCallback) => {
    const  result = await Swal.fire({
        title: 'Are you sure?',
        text:  "You won't be able to revert this",
        icon : 'warning',
        showCancelButton: 'true',
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: 'Yes, delete it!'

    });

    if(result.isConfirmed){
        const {error} = await supabase
        .from(tableName)
        .delete()
        .eq('id',id);
        if(!error){
            Swal.fire('Deleted!', 'Record has bee deleted.' , 'success');
            if(onSuccessCallback) onSuccessCallback(); //to refresh all data after delte
        }else{
            Swal.fire('Error', error.message, 'error')
        }
    }
};


   // Resolve  and Notify  function

   export const resolveAndNotify = async ({
    tableName,itemId,newStatus,userEmail,notifTitle,notifMessage,onSuccessCallback
   })=>{

    try {

        // Update Data in tables 

        const {error : updateError} = await supabase
        .from(tableName)
        .update({status: newStatus})
        .eq('id',itemId)
        .select();  //to prevent code to glitch

        if(updateError) {
            console.log('error in updation from db', updateError);
            throw updateError; //if updaton failed ,stop here   
        }   
        
        // Send notification to user

        const targetUser = userEmail ? userEmail.trim().toLowerCase(): '';  // to clean email
          

        if(targetUser){
            await supabase
            .from('notifications')
            .insert([{
                title: notifTitle,
                message: notifMessage,
                user_email: 'admin@gmail.com',
                target_email: targetUser
            }]);
        }

    // show popup if updation and notification done

    Swal.fire({ 
      toast: true, 
      position: 'top-end', 
      icon: 'success', 
      title: 'Action Successful!', 
      showConfirmButton: false, 
      timer: 2000 
    });

    if (onSuccessCallback) onSuccessCallback();


    } catch (err) {
        console.log("Error:" , err);
        Swal.fire('Error', 'Something went wrong!', 'error');
    }
    }